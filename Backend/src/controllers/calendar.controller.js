import { db } from "../db.js";
import ical from "ical-generator";

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

/* =========================
   Date Helpers
========================= */
const toDate = (v) => (v instanceof Date ? v : new Date(v));
const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);

const safeDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateOnly = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Convocatorias: if no duration is provided, we assume a 90-min match
const DEFAULT_MATCH_DURATION_MIN = 90;

/* =========================
   Normalizers
========================= */
const normalizeEvent = (ev) => {
  const start = safeDate(ev.fecha_inicio);
  const end = safeDate(ev.fecha_fin);

  if (!start || !end) return null;

  return {
    id: `ev-${ev.id}`,
    origen: "evento",
    tipo: ev.tipo || "otro",
    titulo: ev.titulo,
    descripcion: ev.descripcion || null,
    lugar: ev.lugar || null,
    equipo_id: ev.equipo_id,
    inicio: start.toISOString(),
    fin: end.toISOString(),
  };
};

const normalizeMatchCall = (c) => {
  if (!c.fecha_partido || !c.hora_inicio) return null;

  // 🔑 KEY: convert Date → YYYY-MM-DD
  const fecha =
    c.fecha_partido instanceof Date
      ? formatDateOnly(c.fecha_partido)
      : c.fecha_partido;

  const start = safeDate(`${fecha}T${c.hora_inicio}`);
  if (!start) return null;

  const end = addMinutes(start, DEFAULT_MATCH_DURATION_MIN);

  return {
    id: `conv-${c.id}`,
    origen: "convocatoria",
    tipo: "partido",
    titulo: c.rival ? `Partido vs ${c.rival}` : "Partido",
    descripcion: null,
    lugar: c.lugar || null,
    equipo_id: c.equipo_id,
    inicio: start.toISOString(),
    fin: end.toISOString(),
  };
};

/* =========================
   DB Fetchers
========================= */
const getEventsByTeam = async (equipoId) => {
  return query(
    `SELECT id, equipo_id, titulo, descripcion, fecha_inicio, fecha_fin, requiere_confirmacion, fecha_limite_confirmacion, tipo
     FROM eventos
     WHERE equipo_id = ?
     ORDER BY fecha_inicio ASC`,
    [equipoId]
  );
};

const getMatchCallsByTeam = async (equipoId) => {
  return query(
    `SELECT id, equipo_id, rival, lugar, fecha_partido, hora_inicio, hora_quedada, fecha_limite_confirmacion
     FROM convocatorias
     WHERE equipo_id = ?
     ORDER BY fecha_partido ASC`,
    [equipoId]
  );
};

const getEventsByPlayer = async (dni) => {
  return query(
    `SELECT ev.id, ev.equipo_id, ev.titulo, ev.descripcion, ev.fecha_inicio, ev.fecha_fin, ev.requiere_confirmacion, ev.fecha_limite_confirmacion, ev.tipo
     FROM eventos ev
     JOIN evento_jugadores ej ON ej.evento_id = ev.id
     WHERE ej.jugador_dni = ?
     ORDER BY ev.fecha_inicio ASC`,
    [dni]
  );
};

const getMatchCallsByPlayer = async (dni) => {
  return query(
    `SELECT c.id, c.equipo_id, c.rival, c.lugar, c.fecha_partido, c.hora_inicio, c.hora_quedada, c.fecha_limite_confirmacion
     FROM convocatorias c
     JOIN convocatoria_jugadores cj ON cj.convocatoria_id = c.id
     WHERE cj.jugador_dni = ?
     ORDER BY c.fecha_partido ASC`,
    [dni]
  );
};

/**
 * NOTE:
 * Assuming the "equipos" table has a `club_id` column.
 * If it's named differently (idClub, clubId, etc.), update this query accordingly.
 */
const getTeamIdsByClub = async (clubId) => {
  const rows = await query(`SELECT id FROM equipos WHERE club_id = ?`, [
    clubId,
  ]);
  return rows.map((r) => r.id);
};

const getEventsByTeams = async (equipoIds) => {
  if (!equipoIds.length) return [];
  const placeholders = equipoIds.map(() => "?").join(",");
  return query(
    `SELECT id, equipo_id, titulo, descripcion, fecha_inicio, fecha_fin, requiere_confirmacion, fecha_limite_confirmacion, tipo
     FROM eventos
     WHERE equipo_id IN (${placeholders})
     ORDER BY fecha_inicio ASC`,
    equipoIds
  );
};

const getMatchCallsByTeams = async (equipoIds) => {
  if (!equipoIds.length) return [];
  const placeholders = equipoIds.map(() => "?").join(",");
  return query(
    `SELECT id, equipo_id, rival, lugar, fecha_partido, hora_inicio, hora_quedada, fecha_limite_confirmacion
     FROM convocatorias
     WHERE equipo_id IN (${placeholders})
     ORDER BY fecha_partido ASC`,
    equipoIds
  );
};

/* =========================
   Unifier
========================= */
const unify = (events, matchCalls) => {
  const a = events.map(normalizeEvent).filter(Boolean);
  const b = matchCalls.map(normalizeMatchCall).filter(Boolean);

  return [...a, ...b].sort((x, y) => new Date(x.inicio) - new Date(y.inicio));
};

/* =========================
   iCal Builder
========================= */
const buildICal = ({ name, events }) => {
  const cal = ical({
    name,
    // Set timezone for proper Google Calendar interpretation in Spain:
    timezone: "Europe/Madrid",
  });

  events.forEach((e) => {
    const descParts = [
      `Origen: ${e.origen}`,
      `Tipo: ${e.tipo}`,
      e.requiere_confirmacion && e.fecha_limite_confirmacion
        ? `Límite confirmación: ${new Date(e.fecha_limite_confirmacion).toLocaleString("es-ES")}`
        : null,
    ].filter(Boolean);

    cal.createEvent({
      uid: `${e.id}@tfg`,
      start: new Date(e.inicio),
      end: new Date(e.fin),
      summary: e.titulo,
      description: descParts.join("\n"),
      location: e.lugar || undefined,
    });
  });

  return cal;
};

/* =========================
   JSON CONTROLLERS
========================= */
export const getTeamCalendar = async (req, res) => {
  try {
    const { equipoId } = req.params;

    const events = await getEventsByTeam(equipoId);
    const matchCalls = await getMatchCallsByTeam(equipoId);

    res.json(unify(events, matchCalls));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getPlayerCalendar = async (req, res) => {
  try {
    const { dni } = req.params;

    const events = await getEventsByPlayer(dni);
    const matchCalls = await getMatchCallsByPlayer(dni);

    res.json(unify(events, matchCalls));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getClubCalendar = async (req, res) => {
  try {
    const { clubId } = req.params;

    const equipoIds = await getTeamIdsByClub(clubId);
    const events = await getEventsByTeams(equipoIds);
    const matchCalls = await getMatchCallsByTeams(equipoIds);

    res.json(unify(events, matchCalls));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   iCal (.ics) CONTROLLERS
========================= */
export const getTeamICal = async (req, res) => {
  try {
    const { equipoId } = req.params;

    const events = await getEventsByTeam(equipoId);
    const matchCalls = await getMatchCallsByTeam(equipoId);
    const unified = unify(events, matchCalls);

    const cal = buildICal({ name: `Equipo ${equipoId}`, events: unified });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="equipo-${equipoId}.ics"`
    );
    res.send(cal.toString());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getPlayerICal = async (req, res) => {
  try {
    const { dni } = req.params;

    const events = await getEventsByPlayer(dni);
    const matchCalls = await getMatchCallsByPlayer(dni);
    const unified = unify(events, matchCalls);

    const cal = buildICal({ name: `Jugador ${dni}`, events: unified });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="jugador-${dni}.ics"`
    );
    res.send(cal.toString());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const getClubICal = async (req, res) => {
  try {
    const { clubId } = req.params;

    const equipoIds = await getTeamIdsByClub(clubId);
    const events = await getEventsByTeams(equipoIds);
    const matchCalls = await getMatchCallsByTeams(equipoIds);
    const unified = unify(events, matchCalls);

    const cal = buildICal({ name: `Club ${clubId}`, events: unified });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="club-${clubId}.ics"`
    );
    res.send(cal.toString());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
