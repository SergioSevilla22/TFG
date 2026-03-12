import { db } from "../db.js";
import { analyzePlayerAI } from "../services/aiService.js";

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
