import { db } from "../db.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

/* =========================
   GET MATCH CALL STATS
========================= */
export const getMatchCallStats = async (req, res) => {
  const { id } = req.params;

  try {
    const stats = await query(
      `SELECT * FROM estadisticas_convocatoria WHERE convocatoria_id = ?`,
      [id]
    );

    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   SAVE / UPDATE STATS (BULK UPSERT)
========================= */
export const saveMatchCallStats = async (req, res) => {
  const { id } = req.params;
  const { estadisticas } = req.body;
  // estadisticas = [{ jugador_dni, goles, asistencias, ... }]

  try {
    for (const s of estadisticas) {
      await query(
        `INSERT INTO estadisticas_convocatoria
        (convocatoria_id, jugador_dni, minutos, goles, asistencias, amarillas, rojas, estado_asistencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          minutos = VALUES(minutos),
          goles = VALUES(goles),
          asistencias = VALUES(asistencias),
          amarillas = VALUES(amarillas),
          rojas = VALUES(rojas),
          estado_asistencia = VALUES(estado_asistencia)`,
        [
          id,
          s.jugador_dni,
          s.minutos || 0,
          s.goles || 0,
          s.asistencias || 0,
          s.amarillas || 0,
          s.rojas || 0,
          s.estado_asistencia || "presente",
        ]
      );
    }

    res.json({ message: "Estadísticas guardadas correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   GET PLAYER TOTALS
========================= */
export const getPlayerTotals = async (req, res) => {
  const { dni } = req.params;

  try {
    const [totals] = await query(
      `SELECT
        COUNT(*) as partidos,
        SUM(minutos) as minutos,
        SUM(goles) as goles,
        SUM(asistencias) as asistencias,
        SUM(amarillas) as amarillas,
        SUM(rojas) as rojas,
        SUM(CASE WHEN estado_asistencia = 'presente' THEN 1 ELSE 0 END) as presencias,
        SUM(CASE WHEN estado_asistencia = 'tarde' THEN 1 ELSE 0 END) as llegadas_tarde,
        SUM(CASE WHEN estado_asistencia = 'ausente' THEN 1 ELSE 0 END) as ausencias,
        SUM(CASE WHEN estado_asistencia = 'excusado' THEN 1 ELSE 0 END) as excusadas
       FROM estadisticas_convocatoria
       WHERE jugador_dni = ?`,
      [dni]
    );

    res.json(totals || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   GET PLAYER STATS FOR A MATCH CALL
========================= */
export const getPlayerMatchCallStats = async (req, res) => {
  const { convocatoriaId, dni } = req.params;

  try {
    const [data] = await query(
      `SELECT minutos, goles, asistencias, amarillas, rojas, estado_asistencia
       FROM estadisticas_convocatoria
       WHERE convocatoria_id = ? AND jugador_dni = ?`,
      [convocatoriaId, dni]
    );

    res.json(data || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
