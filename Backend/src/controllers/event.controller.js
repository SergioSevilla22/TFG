import { db } from "../db.js";
import { transporter } from "../utils/mailer.js";

/* =========================
   DB Helper
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
    timeStyle: "short",
  });

/* =========================
   EMAIL
========================= */
const sendEventEmail = async ({ to, jugadorNombre, equipoNombre, event }) => {
  if (!to) return;

  const html = `
    <h2>Nuevo evento</h2>
    <p>Hola <b>${jugadorNombre}</b></p>
    <p>Equipo: <b>${equipoNombre}</b></p>
    <ul>
      <li>Título: ${event.titulo}</li>
      ${event.descripcion ? `<li>Descripción: ${event.descripcion}</li>` : ""}
      <li>Inicio: ${formatDate(event.fecha_inicio)}</li>
      <li>Fin: ${formatDate(event.fecha_fin)}</li>
      ${
        event.requiere_confirmacion
          ? `<li>Límite de confirmación: ${formatDate(
              event.fecha_limite_confirmacion
            )}</li>`
          : ""
      }
    </ul>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `📣 Evento ${equipoNombre}`,
    html,
  });
};

/* =========================
   CREATE EVENT
========================= */
export const createEvent = async (req, res) => {
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
      tipo = "otro",
      jugadores = [],
    } = req.body;

    if (!equipo_id || !creador_dni || !titulo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Datos obligatorios faltantes" });
    }

    const [team] = await query("SELECT nombre FROM equipos WHERE id = ?", [
      equipo_id,
    ]);
    if (!team) return res.status(404).json({ message: "Equipo no encontrado" });

    const validTypes = ["entrenamiento", "partido", "reunion", "otro"];
    if (!validTypes.includes(tipo)) {
      return res.status(400).json({ message: "Tipo de evento no válido" });
    }

    const start = new Date(fecha_inicio);
    const end = new Date(fecha_fin);
    const now = new Date();

    /* =========================
       🔴 2. END DATE > START DATE
    ========================= */
    if (end <= start) {
      return res.status(400).json({
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
      });
    }

    /* =========================
       🔴 3. CONFIRMATION DEADLINE
    ========================= */
    let deadline = null;

    if (requiere_confirmacion) {
      if (!fecha_limite_confirmacion) {
        return res.status(400).json({
          message: "La fecha límite de confirmación es obligatoria",
        });
      }

      deadline = new Date(fecha_limite_confirmacion);

      if (deadline <= now) {
        return res.status(400).json({
          message: "La fecha límite de confirmación debe ser futura",
        });
      }

      if (deadline >= start) {
        return res.status(400).json({
          message:
            "La fecha límite de confirmación debe ser anterior al inicio del evento",
        });
      }
    }

    // Insert event
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
        tipo,
      ]
    );

    const eventId = result.insertId;

    // Insert players only if any provided
    if (Array.isArray(jugadores) && jugadores.length > 0) {
      const placeholders = jugadores.map(() => "(?, ?)").join(",");
      const values = [];
      jugadores.forEach((dni) => {
        values.push(eventId, dni);
      });

      await query(
        `INSERT INTO evento_jugadores (evento_id, jugador_dni) VALUES ${placeholders}`,
        values
      );

      // Get emails
      const users = await query(
        `SELECT DNI, nombre, email FROM usuarios WHERE DNI IN (${jugadores
          .map(() => "?")
          .join(",")})`,
        jugadores
      );

      // Send emails and mark as notified
      for (const u of users) {
        if (!u.email) continue;
        await sendEventEmail({
          to: u.email,
          jugadorNombre: u.nombre,
          equipoNombre: team.nombre,
          event: {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            requiere_confirmacion,
            fecha_limite_confirmacion,
          },
        });

        await query(
          `UPDATE evento_jugadores
           SET notificado_at = NOW()
           WHERE evento_id = ? AND jugador_dni = ?`,
          [eventId, u.DNI]
        );
      }
    }

    res.status(201).json({ message: "Evento creado", eventoId: eventId });
  } catch (e) {
    console.error("Error createEvent:", e);
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   LIST EVENTS BY TEAM
========================= */
export const getEventsByTeam = async (req, res) => {
  try {
    const { equipoId } = req.params;
    const events = await query(
      `SELECT * FROM eventos
      WHERE equipo_id = ? AND deleted_at IS NULL
      ORDER BY fecha_inicio DESC`,
      [equipoId]
    );

    if (events.length === 0) return res.json([]);

    const ids = events.map((e) => e.id);
    const players = await query(
      `SELECT ej.*, u.nombre, u.DNI, u.foto
       FROM evento_jugadores ej
       JOIN usuarios u ON u.DNI = ej.jugador_dni
       WHERE ej.evento_id IN (${ids.map(() => "?").join(",")})`,
      ids
    );

    events.forEach((e) => {
      e.jugadores = players.filter((j) => j.evento_id === e.id);
    });

    res.json(events);
  } catch (e) {
    console.error("Error getEventsByTeam:", e);
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   RESPOND TO EVENT
========================= */
export const respondToEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { jugador_dni, estado, motivo } = req.body;

    // 1️⃣ Get event
    const [event] = await query(
      `SELECT fecha_inicio, tipo, requiere_confirmacion, fecha_limite_confirmacion
       FROM eventos
       WHERE id = ?`,
      [id]
    );

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const now = new Date();

    // 2️⃣ Past event
    if (new Date(event.fecha_inicio) <= now) {
      return res.status(403).json({
        message: "El evento ya ha comenzado",
      });
    }

    // 3️⃣ Confirmation deadline
    if (
      event.requiere_confirmacion &&
      event.fecha_limite_confirmacion &&
      new Date(event.fecha_limite_confirmacion) < now
    ) {
      return res.status(403).json({
        message: "Plazo de confirmación cerrado",
      });
    }

    // 4️⃣ Allowed states by event type
    const allowedStatesByType = {
      entrenamiento: ["confirmado", "confirmado_tarde", "rechazado"],
      reunion: ["confirmado", "confirmado_tarde", "rechazado"],
      otro: ["confirmado", "confirmado_tarde", "rechazado"],
      partido: ["confirmado", "rechazado"],
    };

    const validStates = allowedStatesByType[event.tipo] || [
      "confirmado",
      "rechazado",
    ];

    if (!validStates.includes(estado)) {
      return res.status(400).json({
        message: "Estado no permitido para este tipo de evento",
      });
    }

    // 5️⃣ Reason required when applicable
    if (
      (estado === "rechazado" || estado === "confirmado_tarde") &&
      (!motivo || !motivo.trim())
    ) {
      return res.status(400).json({
        message: "Debes indicar un motivo",
      });
    }

    // 6️⃣ Check invitation
    const [record] = await query(
      `SELECT estado
       FROM evento_jugadores
       WHERE evento_id = ? AND jugador_dni = ?`,
      [id, jugador_dni]
    );

    if (!record) {
      return res.status(403).json({
        message: "No estás invitado a este evento",
      });
    }

    // 7️⃣ Avoid double response
    if (record.estado !== "pendiente") {
      return res.status(403).json({
        message: "Ya has respondido a este evento",
      });
    }

    // 8️⃣ Update response
    await query(
      `UPDATE evento_jugadores
       SET estado = ?, motivo = ?, responded_at = NOW()
       WHERE evento_id = ? AND jugador_dni = ?`,
      [estado, motivo || null, id, jugador_dni]
    );

    res.json({ message: "Respuesta registrada correctamente" });
  } catch (error) {
    console.error("Error respondToEvent:", error);
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   SEND EVENT REMINDER
========================= */
export const sendEventReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const pending = await query(
      `SELECT u.email, u.nombre, e.nombre AS equipo
       FROM evento_jugadores ej
       JOIN usuarios u ON u.DNI = ej.jugador_dni
       JOIN eventos ev ON ev.id = ej.evento_id
       JOIN equipos e ON e.id = ev.equipo_id
       WHERE ej.evento_id = ? AND ej.estado = 'pendiente'`,
      [id]
    );

    for (const p of pending) {
      if (!p.email) continue;
      await transporter.sendMail({
        to: p.email,
        subject: "🔔 Recordatorio evento",
        html: `<p>Hola ${p.nombre}, tienes un evento pendiente.</p>`,
      });
    }

    await query(
      `UPDATE evento_jugadores
       SET recordatorio_at = NOW()
       WHERE evento_id = ? AND estado = 'pendiente'`,
      [id]
    );

    res.json({ enviados: pending.length });
  } catch (e) {
    console.error("Error sendEventReminder:", e);
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   DELETE EVENT
========================= */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const r = await query(
      `UPDATE eventos
       SET deleted_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!r.affectedRows) {
      return res
        .status(404)
        .json({ message: "Evento no encontrado (o ya eliminado)" });
    }

    res.json({ message: "Evento eliminado (oculto) correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   EDIT EVENT
========================= */
export const editEvent = async (req, res) => {
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
      jugadores = [],
    } = req.body;

    const [event] = await query(
      `SELECT fecha_inicio FROM eventos WHERE id = ?`,
      [id]
    );

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const now = new Date();

    // 🔒 HARD BLOCK
    if (new Date(event.fecha_inicio) <= now) {
      return res.status(403).json({
        message: "No se puede editar un evento ya iniciado",
      });
    }

    const start = new Date(fecha_inicio);
    const end = new Date(fecha_fin);

    if (end <= start) {
      return res.status(400).json({
        message: "La fecha de fin debe ser posterior al inicio",
      });
    }

    if (requiere_confirmacion && fecha_limite_confirmacion) {
      const deadline = new Date(fecha_limite_confirmacion);

      if (deadline >= start) {
        return res.status(400).json({
          message: "El límite debe ser anterior al inicio",
        });
      }
    }

    // UPDATE event
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
        id,
      ]
    );

    // 🔄 Update players
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
