import { db } from "../db.js";

export const buscarJugadoresGlobal = (req, res) => {
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

export const buscarEntrenadoresGlobal = (req, res) => {
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

export const traspasarUsuario = (req, res) => {
  const { dni } = req.params;
  const { club_id } = req.body;

  if (!dni) return res.status(400).json({ message: "DNI obligatorio" });
  if (!club_id) return res.status(400).json({ message: "club_id obligatorio" });

  // 1) Verificar que el club destino existe
  db.query("SELECT id FROM clubes WHERE id = ?", [club_id], (err, clubs) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!clubs || clubs.length === 0) {
      return res.status(404).json({ message: "Club destino no existe" });
    }

    // 2) Actualizar usuario
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
 * ELIMINAR USUARIO DE LA PLATAFORMA (DELETE REAL)
 * - Recomendado: antes limpiar relaciones directas (equipo_id, club_id)
 * - Importante: si tienes tablas que referencian usuarios por DNI con FK,
 *   esto puede fallar si no tienes ON DELETE CASCADE / SET NULL.
 */
export const eliminarUsuarioPlataforma = (req, res) => {
  const { dni } = req.params;

  if (!dni) return res.status(400).json({ message: "DNI obligatorio" });

  // Opción segura: primero dejar al usuario "desenganchado"
  db.query(
    `UPDATE usuarios SET equipo_id = NULL, club_id = NULL WHERE DNI = ?`,
    [dni],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Ahora borrado real
      db.query(
        `DELETE FROM usuarios WHERE DNI = ?`,
        [dni],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: err2.message });

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
          }

          return res.json({ message: "Usuario eliminado de la plataforma" });
        }
      );
    }
  );
};

