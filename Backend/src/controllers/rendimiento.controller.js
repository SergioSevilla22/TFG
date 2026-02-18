import { db } from "../db.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

/* =========================
   OBTENER RENDIMIENTO ENTRENAMIENTO
========================= */
export const getRendimientoEntrenamiento = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await query(
      `SELECT * FROM rendimiento_entrenamiento WHERE evento_id = ?`,
      [id]
    );

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* =========================
   GUARDAR / ACTUALIZAR RENDIMIENTO
========================= */
export const guardarRendimientoEntrenamiento = async (req, res) => {
  const { id } = req.params;
  const { rendimiento } = req.body;

  try {
    for (const r of rendimiento) {
      await query(
        `INSERT INTO rendimiento_entrenamiento
        (evento_id, jugador_dni, estado_asistencia, nota_general, intensidad, actitud)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          estado_asistencia = VALUES(estado_asistencia),
          nota_general = VALUES(nota_general),
          intensidad = VALUES(intensidad),
          actitud = VALUES(actitud)`,
        [
          id,
          r.jugador_dni,
          r.estado_asistencia || 'presente',
          r.nota_general || 0,
          r.intensidad || 0,
          r.actitud || 0,
        ]
      );
    }

    res.json({ message: "Rendimiento guardado correctamente" });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
