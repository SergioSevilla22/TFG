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

const formatDateOnly = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("es-ES");
};

/* =========================
   EMAIL
========================= */
const sendMatchCallEmail = async ({
  to,
  jugadorNombre,
  equipoNombre,
  matchCall,
}) => {
  if (!to) return;

  const html = `
    <h2>Nueva convocatoria</h2>
    <p>Hola <b>${jugadorNombre}</b></p>
    <p>Equipo: <b>${equipoNombre}</b></p>
    <ul>
      ${matchCall.rival ? `<li>Rival: ${matchCall.rival}</li>` : ""}
      <li>Fecha: ${formatDateOnly(matchCall.fecha_partido)}</li>
      <li>Inicio: ${matchCall.hora_inicio}</li>
      <li>Quedada: ${matchCall.hora_quedada}</li>
      <li>Límite: ${formatDate(matchCall.fecha_limite_confirmacion)}</li>
    </ul>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `📣 Convocatoria ${equipoNombre}`,
    html,
  });
};

/* =========================
   CREATE
========================= */
export const createMatchCall = async (req, res) => {
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
      jugadores,
    } = req.body;

    // 1️⃣ Basic validations
    if (
      !equipo_id ||
      !creador_dni ||
      !fecha_partido ||
      !hora_inicio ||
      !hora_quedada ||
      !fecha_limite_confirmacion
    ) {
      return res.status(400).json({ message: "Datos obligatorios faltantes" });
    }

    if (!Array.isArray(jugadores) || jugadores.length === 0) {
      return res.status(400).json({ message: "Selecciona jugadores" });
    }

    const errors = [];

    // Base dates
    const now = new Date();
    const matchStartDateTime = new Date(`${fecha_partido}T${hora_inicio}`);
    const meetupDateTime = new Date(`${fecha_partido}T${hora_quedada}`);
    const deadline = new Date(fecha_limite_confirmacion);

    // 1️⃣ No past dates allowed
    if (matchStartDateTime < now) {
      errors.push(
        "No se puede crear una convocatoria en una fecha u hora pasada"
      );
    }

    // 2️⃣ Meetup time cannot be after match start
    if (meetupDateTime > matchStartDateTime) {
      errors.push(
        "La hora de quedada no puede ser posterior a la hora de inicio del partido"
      );
    }

    // 3️⃣ Deadline cannot be after match start
    if (deadline > matchStartDateTime) {
      errors.push(
        "La fecha límite de confirmación no puede ser posterior al inicio del partido"
      );
    }

    // 4️⃣ Deadline cannot be after meetup time
    if (deadline > meetupDateTime) {
      errors.push(
        "La fecha límite de confirmación no puede ser posterior a la hora de quedada"
      );
    }

    // ❌ If there are errors → return ALL of them
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Errores de validación",
        errors,
      });
    }

    const conflict = await query(
      `SELECT id
       FROM convocatorias
       WHERE equipo_id = ?
         AND fecha_partido = ?
       LIMIT 1`,
      [equipo_id, fecha_partido]
    );

    if (conflict.length) {
      return res.status(409).json({
        message: "Ya existe una convocatoria para este equipo en esa fecha",
      });
    }

    // 4️⃣ Check team
    const [team] = await query("SELECT nombre FROM equipos WHERE id = ?", [
      equipo_id,
    ]);

    if (!team) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    // 5️⃣ Create match call
    const result = await query(
      `INSERT INTO convocatorias
       (equipo_id, creador_dni, rival, lugar, fecha_partido, hora_inicio, hora_quedada, fecha_limite_confirmacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipo_id,
        creador_dni,
        rival,
        lugar,
        fecha_partido,
        hora_inicio,
        hora_quedada,
        fecha_limite_confirmacion,
      ]
    );

    const matchCallId = result.insertId;

    // 6️⃣ Assign players
    for (const dni of jugadores) {
      await query(
        `INSERT INTO convocatoria_jugadores (convocatoria_id, jugador_dni)
         VALUES (?, ?)`,
        [matchCallId, dni]
      );
    }

    // 7️⃣ Send emails
    const users = await query(
      `SELECT DNI, nombre, email
       FROM usuarios
       WHERE DNI IN (${jugadores.map(() => "?").join(",")})`,
      jugadores
    );

    for (const u of users) {
      if (!u.email) continue;

      await sendMatchCallEmail({
        to: u.email,
        jugadorNombre: u.nombre,
        equipoNombre: team.nombre,
        matchCall: {
          rival,
          lugar,
          fecha_partido,
          hora_inicio,
          hora_quedada,
          fecha_limite_confirmacion,
        },
      });

      await query(
        `UPDATE convocatoria_jugadores
         SET notificado_at = NOW()
         WHERE convocatoria_id = ? AND jugador_dni = ?`,
        [matchCallId, u.DNI]
      );
    }

    res.status(201).json({ message: "Convocatoria creada" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   LIST
========================= */
export const getMatchCallsByTeam = async (req, res) => {
  const { equipoId } = req.params;

  await query(
    `UPDATE convocatoria_jugadores cj
     JOIN convocatorias c ON c.id = cj.convocatoria_id
     SET cj.estado = 'pendiente'
     WHERE cj.estado = 'pendiente'
       AND c.fecha_limite_confirmacion < NOW()`
  );

  const matchCalls = await query(
    `SELECT * FROM convocatorias
    WHERE equipo_id = ? AND deleted_at IS NULL
    ORDER BY fecha_partido DESC`,
    [equipoId]
  );

  if (!matchCalls.length) return res.json([]);

  const ids = matchCalls.map((c) => c.id);
  const players = await query(
    `SELECT cj.*, u.nombre, u.DNI, u.foto
     FROM convocatoria_jugadores cj
     JOIN usuarios u ON u.DNI = cj.jugador_dni
     WHERE cj.convocatoria_id IN (${ids.map(() => "?").join(",")})`,
    ids
  );

  matchCalls.forEach((c) => {
    c.jugadores = players.filter((j) => j.convocatoria_id === c.id);
  });

  res.json(matchCalls);
};

/* =========================
   RESPOND
========================= */
export const respondMatchCall = async (req, res) => {
  const { id } = req.params;
  const { jugador_dni, estado, motivo } = req.body;

  const [matchCall] = await query(
    "SELECT fecha_limite_confirmacion FROM convocatorias WHERE id = ?",
    [id]
  );

  if (!matchCall) return res.status(404).json({ message: "No existe" });

  if (!["confirmado", "rechazado"].includes(estado)) {
    return res.status(400).json({ message: "Estado no válido" });
  }

  if (estado === "rechazado" && (!motivo || !motivo.trim())) {
    return res.status(400).json({
      message: "Debes indicar el motivo de la ausencia",
    });
  }

  if (new Date() > new Date(matchCall.fecha_limite_confirmacion)) {
    return res.status(403).json({ message: "Plazo cerrado" });
  }

  const r = await query(
    `UPDATE convocatoria_jugadores
     SET estado = ?, motivo = ?, responded_at = NOW()
     WHERE convocatoria_id = ? AND jugador_dni = ?`,
    [estado, estado === "rechazado" ? motivo : null, id, jugador_dni]
  );

  if (!r.affectedRows) return res.status(403).json({ message: "No convocado" });

  res.json({ message: "Respuesta guardada" });
};

/* =========================
   REMINDER
========================= */
export const sendReminder = async (req, res) => {
  const { id } = req.params;

  const pending = await query(
    `SELECT u.email, u.nombre, e.nombre AS equipo
     FROM convocatoria_jugadores cj
     JOIN usuarios u ON u.DNI = cj.jugador_dni
     JOIN convocatorias c ON c.id = cj.convocatoria_id
     JOIN equipos e ON e.id = c.equipo_id
     WHERE cj.convocatoria_id = ? AND cj.estado = 'pendiente'`,
    [id]
  );

  for (const p of pending) {
    if (!p.email) continue;
    await transporter.sendMail({
      to: p.email,
      subject: "🔔 Recordatorio convocatoria",
      html: `<p>Hola ${p.nombre}, tienes una convocatoria pendiente.</p>`,
    });
  }

  await query(
    `UPDATE convocatoria_jugadores
     SET recordatorio_at = NOW()
     WHERE convocatoria_id = ? AND estado = 'pendiente'`,
    [id]
  );

  res.json({ enviados: pending.length });
};

/* =========================
   EDIT
========================= */
export const editMatchCall = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rival,
      lugar,
      fecha_partido,
      hora_inicio,
      hora_quedada,
      fecha_limite_confirmacion,
      jugadores,
    } = req.body;

    const [matchCall] = await query(
      `SELECT fecha_limite_confirmacion, fecha_partido, hora_inicio 
       FROM convocatorias 
       WHERE id = ?`,
      [id]
    );

    if (!matchCall) {
      return res.status(404).json({ message: "Convocatoria no encontrada" });
    }

    const now = new Date();
    const currentMatchStart = new Date(
      `${matchCall.fecha_partido}T${matchCall.hora_inicio}`
    );
    const currentDeadline = new Date(matchCall.fecha_limite_confirmacion);

    // 🔒 DO NOT ALLOW EDITING IF ALREADY STARTED OR CLOSED
    if (now > currentMatchStart || now > currentDeadline) {
      return res.status(403).json({
        message: "No se puede editar una convocatoria ya iniciada o cerrada",
      });
    }

    // VALIDATE NEW DATES
    const start = new Date(`${fecha_partido}T${hora_inicio}`);
    const meetup = new Date(`${fecha_partido}T${hora_quedada}`);
    const deadline = new Date(fecha_limite_confirmacion);

    const errors = [];

    if (start < now) errors.push("No se puede establecer una fecha pasada");
    if (meetup > start)
      errors.push("La hora de quedada no puede ser posterior al inicio");
    if (deadline > start)
      errors.push("El límite no puede ser posterior al inicio");

    if (errors.length) return res.status(400).json({ errors });

    // UPDATE match call
    await query(
      `UPDATE convocatorias 
       SET rival=?, lugar=?, fecha_partido=?, hora_inicio=?, hora_quedada=?, fecha_limite_confirmacion=?
       WHERE id=?`,
      [
        rival,
        lugar,
        fecha_partido,
        hora_inicio,
        hora_quedada,
        fecha_limite_confirmacion,
        id,
      ]
    );

    // 🔁 Update players
    await query("DELETE FROM convocatoria_jugadores WHERE convocatoria_id=?", [
      id,
    ]);

    for (const dni of jugadores) {
      await query(
        `INSERT INTO convocatoria_jugadores (convocatoria_id, jugador_dni)
         VALUES (?, ?)`,
        [id, dni]
      );
    }

    res.json({ message: "Convocatoria actualizada" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   DELETE
========================= */
export const deleteMatchCall = async (req, res) => {
  try {
    const { id } = req.params;

    const r = await query(
      `UPDATE convocatorias
       SET deleted_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!r.affectedRows) {
      return res
        .status(404)
        .json({ message: "Convocatoria no encontrada (o ya eliminada)" });
    }

    res.json({ message: "Convocatoria eliminada (oculta) correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
