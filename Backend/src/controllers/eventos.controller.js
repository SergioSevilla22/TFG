import { db } from "../db.js";
import { transporter } from "../utils/mailer.js";

/* =========================
   Helper DB
========================= */
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

const formatDate = (d) =>
  new Date(d).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short"
  });

/* =========================
   EMAIL
========================= */
const sendEventoEmail = async ({ to, jugadorNombre, equipoNombre, evento }) => {
  if (!to) return;

  const html = `
    <h2>Nuevo evento</h2>
    <p>Hola <b>${jugadorNombre}</b></p>
    <p>Equipo: <b>${equipoNombre}</b></p>
    <ul>
      <li>Título: ${evento.titulo}</li>
      ${evento.descripcion ? `<li>Descripción: ${evento.descripcion}</li>` : ""}
      <li>Inicio: ${formatDate(evento.fecha_inicio)}</li>
      <li>Fin: ${formatDate(evento.fecha_fin)}</li>
      ${
        evento.requiere_confirmacion
          ? `<li>Límite de confirmación: ${formatDate(
              evento.fecha_limite_confirmacion
            )}</li>`
          : ""
      }
    </ul>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `📣 Evento ${equipoNombre}`,
    html
  });
};

/* =========================
   CREAR EVENTO
========================= */
export const crearEvento = async (req, res) => {
  try {
    const {
      equipo_id,
      creador_dni,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      requiere_confirmacion = false,
      fecha_limite_confirmacion,
      jugadores = []
    } = req.body;

    if (!equipo_id || !creador_dni || !titulo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Datos obligatorios faltantes" });
    }

    const [equipo] = await query("SELECT nombre FROM equipos WHERE id = ?", [
      equipo_id
    ]);
    if (!equipo) return res.status(404).json({ message: "Equipo no encontrado" });

    // Insert evento
    const result = await query(
      `INSERT INTO eventos
      (equipo_id, creador_dni, titulo, descripcion, fecha_inicio, fecha_fin, requiere_confirmacion, fecha_limite_confirmacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipo_id,
        creador_dni,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        requiere_confirmacion ? 1 : 0,
        fecha_limite_confirmacion || null
      ]
    );

    const eventoId = result.insertId;

    // Insert jugadores solo si hay alguno
    if (Array.isArray(jugadores) && jugadores.length > 0) {
      const placeholders = jugadores.map(() => "(?, ?)").join(",");
      const values = [];
      jugadores.forEach((dni) => {
        values.push(eventoId, dni);
      });

      await query(
        `INSERT INTO evento_jugadores (evento_id, jugador_dni) VALUES ${placeholders}`,
        values
      );

      // Obtener emails
      const usuarios = await query(
        `SELECT DNI, nombre, email FROM usuarios WHERE DNI IN (${jugadores
          .map(() => "?")
          .join(",")})`,
        jugadores
      );

      // Enviar emails y marcar notificado
      for (const u of usuarios) {
        if (!u.email) continue;
        await sendEventoEmail({
          to: u.email,
          jugadorNombre: u.nombre,
          equipoNombre: equipo.nombre,
          evento: {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            requiere_confirmacion,
            fecha_limite_confirmacion
          }
        });

        await query(
          `UPDATE evento_jugadores
           SET notificado_at = NOW()
           WHERE evento_id = ? AND jugador_dni = ?`,
          [eventoId, u.DNI]
        );
      }
    }

    res.status(201).json({ message: "Evento creado", eventoId });
  } catch (e) {
    console.error("Error crearEvento:", e);
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   LISTAR EVENTOS POR EQUIPO
========================= */
export const obtenerEventosPorEquipo = async (req, res) => {
  try {
    const { equipoId } = req.params;
    const eventos = await query(
      `SELECT * FROM eventos WHERE equipo_id = ? ORDER BY fecha_inicio DESC`,
      [equipoId]
    );

    if (eventos.length === 0) return res.json([]);

    const ids = eventos.map((e) => e.id);
    const jugadores = await query(
      `SELECT ej.*, u.nombre, u.DNI
       FROM evento_jugadores ej
       JOIN usuarios u ON u.DNI = ej.jugador_dni
       WHERE ej.evento_id IN (${ids.map(() => "?").join(",")})`,
      ids
    );

    eventos.forEach((e) => {
      e.jugadores = jugadores.filter((j) => j.evento_id === e.id);
    });

    res.json(eventos);
  } catch (e) {
    console.error("Error obtenerEventosPorEquipo:", e);
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   RESPONDER EVENTO
========================= */
export const responderEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { jugador_dni, estado } = req.body;

    const [evento] = await query(
      "SELECT fecha_limite_confirmacion FROM eventos WHERE id = ?",
      [id]
    );

    if (!evento) return res.status(404).json({ message: "Evento no existe" });

    if (
      evento.fecha_limite_confirmacion &&
      new Date() > new Date(evento.fecha_limite_confirmacion)
    ) {
      return res.status(403).json({ message: "Plazo de confirmación cerrado" });
    }

    const r = await query(
      `UPDATE evento_jugadores
       SET estado = ?, responded_at = NOW()
       WHERE evento_id = ? AND jugador_dni = ?`,
      [estado, id, jugador_dni]
    );

    if (!r.affectedRows) return res.status(403).json({ message: "No convocado" });

    res.json({ message: "Respuesta guardada" });
  } catch (e) {
    console.error("Error responderEvento:", e);
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   ENVIAR RECORDATORIO
========================= */
export const enviarRecordatorioEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const pendientes = await query(
      `SELECT u.email, u.nombre, e.nombre AS equipo
       FROM evento_jugadores ej
       JOIN usuarios u ON u.DNI = ej.jugador_dni
       JOIN eventos ev ON ev.id = ej.evento_id
       JOIN equipos e ON e.id = ev.equipo_id
       WHERE ej.evento_id = ? AND ej.estado = 'pendiente'`,
      [id]
    );

    for (const p of pendientes) {
      if (!p.email) continue;
      await transporter.sendMail({
        to: p.email,
        subject: "🔔 Recordatorio evento",
        html: `<p>Hola ${p.nombre}, tienes un evento pendiente.</p>`
      });
    }

    await query(
      `UPDATE evento_jugadores
       SET recordatorio_at = NOW()
       WHERE evento_id = ? AND estado = 'pendiente'`,
      [id]
    );

    res.json({ enviados: pendientes.length });
  } catch (e) {
    console.error("Error enviarRecordatorio:", e);
    res.status(500).json({ error: e.message });
  }
};
