import { db } from "../db.js";

export const getSeasons = (req, res) => {
  db.query("SELECT * FROM temporadas ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const createSeason = (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({
      message: "El nombre de la temporada es obligatorio",
    });
  }

  // Validate format 2024/2025
  const match = nombre.match(/^(\d{4})\/(\d{4})$/);

  if (!match) {
    return res.status(400).json({
      message: "Formato de temporada inválido. Use YYYY/YYYY",
    });
  }

  const year = parseInt(match[2], 10); // 2025

  // Check for duplicates
  db.query(
    "SELECT id FROM temporadas WHERE nombre = ?",
    [nombre],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (rows.length > 0) {
        return res.status(400).json({
          message: "La temporada ya existe",
        });
      }

      // Insert season
      db.query(
        "INSERT INTO temporadas (nombre, anio, activa) VALUES (?, ?, 0)",
        [nombre, year],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.status(201).json({
            message: "Temporada creada correctamente",
            id: result.insertId,
          });
        }
      );
    }
  );
};

export const activateSeason = (req, res) => {
  const { id } = req.params;

  db.query("UPDATE temporadas SET activa = 0", [], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(
      "UPDATE temporadas SET activa = 1 WHERE id = ?",
      [id],
      (err2, result2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        if (result2.affectedRows === 0) {
          return res.status(404).json({ message: "Temporada no encontrada" });
        }

        res.json({ message: "Temporada activada correctamente" });
      }
    );
  });
};

export const deleteSeason = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM temporadas WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Temporada no encontrada" });
    }

    res.json({ message: "Temporada eliminada correctamente" });
  });
};
