import { db } from "../db.js";

export const getTeamsByClub = (req, res) => {
  const { clubId } = req.params;
  const { nombre, categoria, temporada } = req.query;

  let sql = `
    SELECT e.id, e.nombre, c.nombre AS categoria, t.nombre AS temporada
    FROM equipos e
    JOIN categorias c ON e.categoria_id = c.id
    JOIN temporadas t ON e.temporada_id = t.id
    WHERE e.club_id = ?
  `;

  const values = [clubId];

  if (nombre) {
    sql += " AND e.nombre LIKE ?";
    values.push(`%${nombre}%`);
  }

  if (categoria) {
    sql += " AND c.nombre LIKE ?";
    values.push(`%${categoria}%`);
  }

  if (temporada) {
    sql += " AND t.nombre LIKE ?";
    values.push(`%${temporada}%`);
  }

  sql += " ORDER BY e.nombre ASC";

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const getTeamById = (req, res) => {
  const { id } = req.params;

  const teamQuery = `
    SELECT 
      e.id AS equipo_id,
      e.nombre AS equipo_nombre,
      
      c.id AS club_id,
      c.nombre AS club_nombre,
      c.escudo AS club_escudo,
      c.poblacion AS club_poblacion,
      c.provincia AS club_provincia,

      cat.id AS categoria_id,
      cat.nombre AS categoria_nombre,
      cat.edad_min,
      cat.edad_max,

      t.id AS temporada_id,
      t.nombre AS temporada_nombre,
      t.anio AS temporada_anio

    FROM equipos e
    JOIN clubes c ON c.id = e.club_id
    JOIN categorias cat ON cat.id = e.categoria_id
    JOIN temporadas t ON t.id = e.temporada_id
    WHERE e.id = ?
  `;

  db.query(teamQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });

    const team = results[0];

    /* ------------- Get players ------------- */
    db.query(
      `SELECT DNI, nombre, telefono, email, foto
       FROM usuarios 
       WHERE equipo_id = ? AND Rol = 'jugador'`,
      [id],
      (err2, players) => {
        if (err2) return res.status(500).json({ error: err2.message });

        /* ------------- Get coaches ------------- */
        db.query(
          `SELECT DNI, nombre, telefono, email, foto 
          FROM usuarios 
          WHERE equipo_id = ? AND Rol = 'entrenador'`,
          [id],
          (err3, coaches) => {
            if (err3) return res.status(500).json({ error: err3.message });

            return res.json({
              id: team.equipo_id,
              nombre: team.equipo_nombre,
              club: {
                id: team.club_id,
                nombre: team.club_nombre,
                escudo: team.club_escudo,
                poblacion: team.club_poblacion,
                provincia: team.club_provincia,
              },
              categoria: {
                id: team.categoria_id,
                nombre: team.categoria_nombre,
                edadMin: team.edad_min,
                edadMax: team.edad_max,
              },
              temporada: {
                id: team.temporada_id,
                nombre: team.temporada_nombre,
                anio: team.temporada_anio,
              },
              entrenadores: coaches,
              jugadores: players,
            });
          }
        );
      }
    );
  });
};

/* ===============================================
    2. Assign Players to a team
================================================ */

export const assignPlayers = (req, res) => {
  const { id } = req.params; // equipoId
  const { jugadores } = req.body;

  if (!Array.isArray(jugadores) || jugadores.length === 0) {
    return res
      .status(400)
      .json({ message: "jugadores debe ser un array de DNI" });
  }

  // 1) Get club_id from team
  db.query(`SELECT club_id FROM equipos WHERE id = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });

    const clubId = rows[0].club_id;

    // 2) Assign ONLY players from the same club
    db.query(
      `UPDATE usuarios
       SET equipo_id = ?
       WHERE Rol = 'jugador'
       AND club_id = ?
       AND DNI IN (?)`,
      [id, clubId, jugadores],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        return res.json({
          message: "Jugadores asignados correctamente",
          asignados: result.affectedRows,
        });
      }
    );
  });
};

/* ===============================================
    3. Assign Coach
================================================ */

export const assignCoach = (req, res) => {
  const { id } = req.params; // equipoId
  const { entrenador } = req.body;

  if (!entrenador)
    return res.status(400).json({ message: "DNI del entrenador requerido" });

  db.query(`SELECT club_id FROM equipos WHERE id = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Equipo no encontrado" });

    const clubId = rows[0].club_id;

    // Remove coach from any other team
    db.query(
      `UPDATE usuarios SET equipo_id = NULL WHERE DNI = ? AND Rol='entrenador'`,
      [entrenador],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        // Assign ONLY if coach belongs to the club
        db.query(
          `UPDATE usuarios SET equipo_id = ?
         WHERE DNI = ? AND Rol='entrenador' AND club_id = ?`,
          [id, entrenador, clubId],
          (err3, result) => {
            if (err3) return res.status(500).json({ error: err3.message });
            if (result.affectedRows === 0) {
              return res
                .status(400)
                .json({
                  message: "Ese entrenador no pertenece al club del equipo",
                });
            }
            res.json({ message: "Entrenador asignado correctamente" });
          }
        );
      }
    );
  });
};

export const movePlayer = (req, res) => {
  const { jugador, nuevoEquipoId } = req.body;

  if (!jugador || nuevoEquipoId === undefined) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  db.query(
    `UPDATE usuarios SET equipo_id = ? WHERE DNI = ? AND Rol = 'jugador'`,
    [nuevoEquipoId, jugador],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Jugador no encontrado" });
      }

      res.json({ message: "Jugador actualizado correctamente" });
    }
  );
};

export const createTeam = (req, res) => {
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
          return res
            .status(400)
            .json({ message: "Ese equipo ya existe en este club" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: "Equipo creado", id: result.insertId });
    }
  );
};

export const deleteTeam = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM equipos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Equipo eliminado" });
  });
};

export const removeCoachFromTeam = (req, res) => {
  const { dni } = req.body;

  if (!dni) {
    return res.status(400).json({ message: "DNI requerido" });
  }

  db.query(
    `UPDATE usuarios 
     SET equipo_id = NULL 
     WHERE DNI = ? AND Rol = 'entrenador'`,
    [dni],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Entrenador no encontrado" });
      }

      res.json({ message: "Entrenador quitado del equipo" });
    }
  );
};
