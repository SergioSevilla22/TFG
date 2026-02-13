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
      tipo = 'otro',
      jugadores = []
    } = req.body;

    if (!equipo_id || !creador_dni || !titulo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Datos obligatorios faltantes" });
    }

    const [equipo] = await query("SELECT nombre FROM equipos WHERE id = ?", [
      equipo_id
    ]);
    if (!equipo) return res.status(404).json({ message: "Equipo no encontrado" });

    const tiposValidos = ['entrenamiento', 'partido', 'reunion', 'otro'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de evento no válido' });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    const ahora = new Date();

    /* =========================
       🔴 2. FECHA FIN > FECHA INICIO
    ========================= */
    if (fin <= inicio) {
      return res.status(400).json({
        message: "La fecha de fin debe ser posterior a la fecha de inicio"
      });
    }

    /* =========================
       🔴 3. FECHA LÍMITE CONFIRMACIÓN
    ========================= */
    let fechaLimite = null;

    if (requiere_confirmacion) {
      if (!fecha_limite_confirmacion) {
        return res.status(400).json({
          message: "La fecha límite de confirmación es obligatoria"
        });
      }

      fechaLimite = new Date(fecha_limite_confirmacion);

      if (fechaLimite <= ahora) {
        return res.status(400).json({
          message: "La fecha límite de confirmación debe ser futura"
        });
      }

      if (fechaLimite >= inicio) {
        return res.status(400).json({
          message: "La fecha límite de confirmación debe ser anterior al inicio del evento"
        });
      }
    }

    // Insert evento
    const result = await query(
      `INSERT INTO eventos
      (equipo_id, creador_dni, titulo, descripcion, fecha_inicio, fecha_fin, requiere_confirmacion, fecha_limite_confirmacion, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipo_id,
        creador_dni,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        requiere_confirmacion ? 1 : 0,
        fecha_limite_confirmacion || null,
        tipo
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
/* =========================
   RESPONDER EVENTO
========================= */
export const responderEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { jugador_dni, estado, motivo } = req.body;

    // 1️⃣ Obtener evento
    const [evento] = await query(
      `SELECT fecha_inicio, tipo, requiere_confirmacion, fecha_limite_confirmacion
       FROM eventos
       WHERE id = ?`,
      [id]
    );

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const ahora = new Date();

    // 2️⃣ Evento pasado
    if (new Date(evento.fecha_inicio) <= ahora) {
      return res.status(403).json({
        message: "El evento ya ha comenzado"
      });
    }

    // 3️⃣ Límite de confirmación
    if (
      evento.requiere_confirmacion &&
      evento.fecha_limite_confirmacion &&
      new Date(evento.fecha_limite_confirmacion) < ahora
    ) {
      return res.status(403).json({
        message: "Plazo de confirmación cerrado"
      });
    }

    // 4️⃣ Estados permitidos según tipo
    const estadosPermitidosPorTipo = {
      entrenamiento: ['confirmado', 'confirmado_tarde', 'rechazado'],
      reunion: ['confirmado', 'confirmado_tarde', 'rechazado'],
      otro: ['confirmado', 'confirmado_tarde', 'rechazado'],
      partido: ['confirmado', 'rechazado']
    };

    const estadosValidos =
      estadosPermitidosPorTipo[evento.tipo] || ['confirmado', 'rechazado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado no permitido para este tipo de evento"
      });
    }

    // 5️⃣ Motivo obligatorio cuando toca
    if (
      (estado === 'rechazado' || estado === 'confirmado_tarde') &&
      (!motivo || !motivo.trim())
    ) {
      return res.status(400).json({
        message: "Debes indicar un motivo"
      });
    }

    // 6️⃣ Comprobar invitación
    const [registro] = await query(
      `SELECT estado
       FROM evento_jugadores
       WHERE evento_id = ? AND jugador_dni = ?`,
      [id, jugador_dni]
    );

    if (!registro) {
      return res.status(403).json({
        message: "No estás invitado a este evento"
      });
    }

    // 7️⃣ Evitar doble respuesta
    if (registro.estado !== 'pendiente') {
      return res.status(403).json({
        message: "Ya has respondido a este evento"
      });
    }

    // 8️⃣ Actualizar respuesta
    await query(
      `UPDATE evento_jugadores
       SET estado = ?, motivo = ?, responded_at = NOW()
       WHERE evento_id = ? AND jugador_dni = ?`,
      [estado, motivo || null, id, jugador_dni]
    );

    res.json({ message: "Respuesta registrada correctamente" });

  } catch (error) {
    console.error("Error responderEvento:", error);
    res.status(500).json({ error: error.message });
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

// =========================
// ELIMINAR EVENTO
// =========================
export const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminamos los registros relacionados
    await query("DELETE FROM evento_jugadores WHERE evento_id = ?", [id]);

    // Luego eliminamos el evento
    const result = await query("DELETE FROM eventos WHERE id = ?", [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento eliminado correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const editarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      requiere_confirmacion,
      fecha_limite_confirmacion,
      tipo,
      jugadores = []
    } = req.body;

    const [evento] = await query(
      `SELECT fecha_inicio FROM eventos WHERE id = ?`,
      [id]
    );

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const ahora = new Date();

    // 🔒 BLOQUEO REAL
    if (new Date(evento.fecha_inicio) <= ahora) {
      return res.status(403).json({
        message: "No se puede editar un evento ya iniciado"
      });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (fin <= inicio) {
      return res.status(400).json({
        message: "La fecha de fin debe ser posterior al inicio"
      });
    }

    if (requiere_confirmacion && fecha_limite_confirmacion) {
      const limite = new Date(fecha_limite_confirmacion);

      if (limite >= inicio) {
        return res.status(400).json({
          message: "El límite debe ser anterior al inicio"
        });
      }
    }

    // UPDATE evento
    await query(
      `UPDATE eventos
       SET titulo=?, descripcion=?, fecha_inicio=?, fecha_fin=?,
           requiere_confirmacion=?, fecha_limite_confirmacion=?, tipo=?
       WHERE id=?`,
      [
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        requiere_confirmacion ? 1 : 0,
        requiere_confirmacion ? fecha_limite_confirmacion : null,
        tipo,
        id
      ]
    );

    // 🔄 actualizar jugadores
    await query("DELETE FROM evento_jugadores WHERE evento_id=?", [id]);

    if (jugadores.length > 0) {

      const placeholders = jugadores.map(() => "(?, ?)").join(",");
      const values = [];
    
      jugadores.forEach((dni) => {
        values.push(id, dni);
      });
    
      await query(
        `INSERT INTO evento_jugadores (evento_id, jugador_dni)
         VALUES ${placeholders}`,
        values
      );
    }
    

    res.json({ message: "Evento actualizado correctamente" });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


