import { db } from "../db.js";

export const searchPlayersGlobal = (req, res) => {
  const q = (req.query.q || "").trim();

  if (!q) return res.json([]);

  db.query(
    `SELECT DNI, nombre, club_id, equipo_id
     FROM usuarios
     WHERE Rol = 'jugador'
     AND (DNI LIKE ? OR nombre LIKE ?)
     ORDER BY nombre ASC
     LIMIT 30`,
    [`%${q}%`, `%${q}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

export const searchCoachesGlobal = (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  db.query(
    `SELECT DNI, nombre, club_id, equipo_id
     FROM usuarios
     WHERE Rol = 'entrenador'
       AND (DNI LIKE ? OR nombre LIKE ?)
     ORDER BY nombre ASC
     LIMIT 30`,
    [`%${q}%`, `%${q}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

export const transferUser = (req, res) => {
  const { dni } = req.params;
  const { club_id } = req.body;

  if (!dni) return res.status(400).json({ message: "DNI obligatorio" });
  if (!club_id) return res.status(400).json({ message: "club_id obligatorio" });

  // 1) Check that the destination club exists
  db.query("SELECT id FROM clubes WHERE id = ?", [club_id], (err, clubs) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!clubs || clubs.length === 0) {
      return res.status(404).json({ message: "Club destino no existe" });
    }

    // 2) Update user
    db.query(
      `UPDATE usuarios
       SET club_id = ?, equipo_id = NULL
       WHERE DNI = ?`,
      [club_id, dni],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({ message: "Usuario traspasado correctamente" });
      }
    );
  });
};

/**
 * DELETE USER FROM PLATFORM (HARD DELETE)
 * - Recommended: clean up direct relations first (equipo_id, club_id)
 * - Important: if you have tables referencing users by DNI with FK,
 *   this may fail if you don't have ON DELETE CASCADE / SET NULL.
 */
export const deletePlatformUser = (req, res) => {
  const { dni } = req.params;

  if (!dni) return res.status(400).json({ message: "DNI obligatorio" });

  // Safe approach: first detach the user
  db.query(
    `UPDATE usuarios SET equipo_id = NULL, club_id = NULL WHERE DNI = ?`,
    [dni],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Now hard delete
      db.query(`DELETE FROM usuarios WHERE DNI = ?`, [dni], (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({ message: "Usuario eliminado de la plataforma" });
      });
    }
  );
};
