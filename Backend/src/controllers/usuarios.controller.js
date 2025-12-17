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

