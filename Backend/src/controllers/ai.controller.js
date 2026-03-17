import { db } from "../db.js";
import { analyzePlayerAI, analyzeAttendanceAI } from "../services/aiService.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

export const getAIPlayerAnalysis = async (req, res) => {
  const { dni } = req.params;

  try {
    const stats = await query(
      `SELECT minutos, goles, asistencias, amarillas, rojas, estado_asistencia
       FROM estadisticas_convocatoria
       WHERE jugador_dni = ?`,
      [dni]
    );

    const training = await query(
      `SELECT nota_general, intensidad, actitud, estado_asistencia
       FROM rendimiento_entrenamiento
       WHERE jugador_dni = ?`,
      [dni]
    );

    const aiResult = await analyzePlayerAI(stats, training);

    res.json(aiResult);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getAIAttendance = async (req, res) => {
  const { dni } = req.params;

  try {
    const stats = await query(
      `SELECT 
         ec.estado_asistencia,
         c.rival,
         c.fecha_partido
       FROM estadisticas_convocatoria ec
       JOIN convocatorias c 
         ON ec.convocatoria_id = c.id
       WHERE ec.jugador_dni = ?
       ORDER BY c.fecha_partido DESC
       LIMIT 5`,
      [dni]
    );

    const result = await analyzeAttendanceAI(stats);

    const history = stats.reverse().map((s) => {
      let value = 0;

      if (s.estado_asistencia === "presente") value = 3;
      else if (s.estado_asistencia === "tarde") value = 2;
      else if (s.estado_asistencia === "excusado") value = 1;
      else value = 0;

      const fecha = new Date(s.fecha_partido).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });

      return {
        match: `${s.rival} ${fecha}`,
        value: value,
      };
    });

    res.json({
      ...result,
      history,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
