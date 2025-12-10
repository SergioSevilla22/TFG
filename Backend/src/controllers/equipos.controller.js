import { db } from "../db.js";

export const obtenerEquiposPorClub = (req, res) => {
  const { clubId } = req.params;

  db.query(
    `SELECT e.id, e.nombre, c.nombre AS categoria, t.nombre AS temporada
     FROM equipos e
     JOIN categorias c ON e.categoria_id = c.id
     JOIN temporadas t ON e.temporada_id = t.id
     WHERE e.club_id = ?`,
    [clubId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

export const crearEquipo = (req, res) => {
  const { nombre, club_id, categoria_id, temporada_id } = req.body;

  if (!nombre || !club_id || !categoria_id || !temporada_id) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  db.query(
    `INSERT INTO equipos (nombre, club_id, categoria_id, temporada_id)
     VALUES (?, ?, ?, ?)`,
    [nombre, club_id, categoria_id, temporada_id],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Ese equipo ya existe en este club" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: "Equipo creado", id: result.insertId });
    }
  );
};

export const eliminarEquipo = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM equipos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Equipo eliminado" });
  });
};
