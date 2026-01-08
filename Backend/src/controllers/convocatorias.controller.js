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
const sendConvocatoriaEmail = async ({ to, jugadorNombre, equipoNombre, convocatoria }) => {
  if (!to) return;

  const html = `
    <h2>Nueva convocatoria</h2>
    <p>Hola <b>${jugadorNombre}</b></p>
    <p>Equipo: <b>${equipoNombre}</b></p>
    <ul>
      ${convocatoria.rival ? `<li>Rival: ${convocatoria.rival}</li>` : ""}
      <li>Fecha: ${formatDate(convocatoria.fecha_partido)}</li>
      <li>Inicio: ${convocatoria.hora_inicio}</li>
      <li>Quedada: ${convocatoria.hora_quedada}</li>
      <li>Límite: ${formatDate(convocatoria.fecha_limite_confirmacion)}</li>
    </ul>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `📣 Convocatoria ${equipoNombre}`,
    html
  });
};

/* =========================
   CREAR
========================= */
export const crearConvocatoria = async (req, res) => {
  try {
    const {
      equipo_id,
      creador_dni,
      rival,
      lugar,
      fecha_partido,
      hora_inicio,
      hora_quedada,
      fecha_limite_confirmacion,
      jugadores
    } = req.body;

    if (!equipo_id || !creador_dni || !fecha_partido || !hora_inicio || !hora_quedada || !fecha_limite_confirmacion) {
      return res.status(400).json({ message: "Datos obligatorios faltantes" });
    }

    if (!Array.isArray(jugadores) || jugadores.length === 0) {
      return res.status(400).json({ message: "Selecciona jugadores" });
    }

    const [equipo] = await query("SELECT nombre FROM equipos WHERE id = ?", [equipo_id]);
    if (!equipo) return res.status(404).json({ message: "Equipo no encontrado" });

    const result = await query(
      `INSERT INTO convocatorias
       (equipo_id, creador_dni, rival, lugar, fecha_partido, hora_inicio, hora_quedada, fecha_limite_confirmacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [equipo_id, creador_dni, rival, lugar, fecha_partido, hora_inicio, hora_quedada, fecha_limite_confirmacion]
    );

    const convocatoriaId = result.insertId;

    for (const dni of jugadores) {
      await query(
        `INSERT INTO convocatoria_jugadores (convocatoria_id, jugador_dni)
         VALUES (?, ?)`,
        [convocatoriaId, dni]
      );
    }

    const usuarios = await query(
      `SELECT DNI, nombre, email FROM usuarios
       WHERE DNI IN (${jugadores.map(() => "?").join(",")})`,
      jugadores
    );

    for (const u of usuarios) {
      if (!u.email) continue;
      await sendConvocatoriaEmail({
        to: u.email,
        jugadorNombre: u.nombre,
        equipoNombre: equipo.nombre,
        convocatoria: { rival, lugar, fecha_partido, hora_inicio, hora_quedada, fecha_limite_confirmacion }
      });

      await query(
        `UPDATE convocatoria_jugadores
         SET notificado_at = NOW()
         WHERE convocatoria_id = ? AND jugador_dni = ?`,
        [convocatoriaId, u.DNI]
      );
    }

    res.status(201).json({ message: "Convocatoria creada" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   LISTAR
========================= */
export const obtenerConvocatoriasPorEquipo = async (req, res) => {
  const { equipoId } = req.params;

  const convocatorias = await query(
    `SELECT * FROM convocatorias WHERE equipo_id = ? ORDER BY fecha_partido DESC`,
    [equipoId]
  );

  if (!convocatorias.length) return res.json([]);

  const ids = convocatorias.map(c => c.id);
  const jugadores = await query(
    `SELECT cj.*, u.nombre, u.DNI
     FROM convocatoria_jugadores cj
     JOIN usuarios u ON u.DNI = cj.jugador_dni
     WHERE cj.convocatoria_id IN (${ids.map(() => "?").join(",")})`,
    ids
  );

  convocatorias.forEach(c => {
    c.jugadores = jugadores.filter(j => j.convocatoria_id === c.id);
  });

  res.json(convocatorias);
};

/* =========================
   RESPONDER
========================= */
export const responderConvocatoria = async (req, res) => {
  const { id } = req.params;
  const { jugador_dni, estado } = req.body;

  const [conv] = await query(
    "SELECT fecha_limite_confirmacion FROM convocatorias WHERE id = ?",
    [id]
  );

  if (!conv) return res.status(404).json({ message: "No existe" });

  if (new Date() > new Date(conv.fecha_limite_confirmacion)) {
    return res.status(403).json({ message: "Plazo cerrado" });
  }

  const r = await query(
    `UPDATE convocatoria_jugadores
     SET estado = ?, responded_at = NOW()
     WHERE convocatoria_id = ? AND jugador_dni = ?`,
    [estado, id, jugador_dni]
  );

  if (!r.affectedRows) return res.status(403).json({ message: "No convocado" });

  res.json({ message: "Respuesta guardada" });
};

/* =========================
   RECORDATORIO
========================= */
export const enviarRecordatorio = async (req, res) => {
  const { id } = req.params;

  const pendientes = await query(
    `SELECT u.email, u.nombre, e.nombre AS equipo
     FROM convocatoria_jugadores cj
     JOIN usuarios u ON u.DNI = cj.jugador_dni
     JOIN convocatorias c ON c.id = cj.convocatoria_id
     JOIN equipos e ON e.id = c.equipo_id
     WHERE cj.convocatoria_id = ? AND cj.estado = 'pendiente'`,
    [id]
  );

  for (const p of pendientes) {
    if (!p.email) continue;
    await transporter.sendMail({
      to: p.email,
      subject: "🔔 Recordatorio convocatoria",
      html: `<p>Hola ${p.nombre}, tienes una convocatoria pendiente.</p>`
    });
  }

  await query(
    `UPDATE convocatoria_jugadores
     SET recordatorio_at = NOW()
     WHERE convocatoria_id = ? AND estado = 'pendiente'`,
    [id]
  );

  res.json({ enviados: pendientes.length });
};
