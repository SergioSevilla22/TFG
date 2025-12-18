import { db } from "../db.js";

export const obtenerEquiposPorClub = (req, res) => {
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


export const obtenerEquipoPorId = (req, res) => {
  const { id } = req.params;

  const queryEquipo = `
    SELECT 
      e.id AS equipo_id,
      e.nombre AS equipo_nombre,
      
      c.id AS club_id,
      c.nombre AS club_nombre,
      c.escudo AS club_escudo,
      c.poblacion AS club_poblacion,
      c.provincia AS club_provincia,

      cat.nombre AS categoria_nombre,
      t.nombre AS temporada_nombre

    FROM equipos e
    JOIN clubes c ON c.id = e.club_id
    JOIN categorias cat ON cat.id = e.categoria_id
    JOIN temporadas t ON t.id = e.temporada_id
    WHERE e.id = ?
  `;

  db.query(queryEquipo, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Equipo no encontrado" });

    const equipo = results[0];

    /* ------------- Obtener jugadores ------------- */
    db.query(
      `SELECT DNI, nombre, telefono, foto
       FROM usuarios 
       WHERE equipo_id = ? AND Rol = 'jugador'`,
      [id],
      (err2, jugadores) => {

        if (err2) return res.status(500).json({ error: err2.message });
        /* ------------- Obtener entrenadores ------------- */
        db.query(
          `SELECT DNI, nombre, foto 
          FROM usuarios 
          WHERE equipo_id = ? AND Rol = 'entrenador'`,
          [id],
          (err3, entrenadores) => {

            if (err3) return res.status(500).json({ error: err3.message });

            return res.json({
              id: equipo.equipo_id,
              nombre: equipo.equipo_nombre,
              club: {
                id: equipo.club_id,
                nombre: equipo.club_nombre,
                escudo: equipo.club_escudo,
                poblacion: equipo.club_poblacion,
                provincia: equipo.club_provincia
              },
              categoria: equipo.categoria_nombre,
              temporada: equipo.temporada_nombre,
              entrenadores, // 👈 ARRAY
              jugadores
            });
          }
        );
      }
    );
  });
};

/* ===============================================
    2. Asignar Jugadores a un equipo
================================================ */

export const asignarJugadores = (req, res) => {
  const { id } = req.params; // equipoId
  const { jugadores } = req.body;

  if (!Array.isArray(jugadores) || jugadores.length === 0) {
    return res.status(400).json({ message: "jugadores debe ser un array de DNI" });
  }

  // 1) Obtener club_id del equipo
  db.query(`SELECT club_id FROM equipos WHERE id = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ message: "Equipo no encontrado" });

    const clubId = rows[0].club_id;

    // 2) Asignar SOLO jugadores del mismo club
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
          asignados: result.affectedRows
        });
      }
    );
  });
};

/* ===============================================
    3. Asignar Entrenador
================================================ */

export const asignarEntrenador = (req, res) => {
  const { id } = req.params; // equipoId
  const { entrenador } = req.body;

  if (!entrenador) return res.status(400).json({ message: "DNI del entrenador requerido" });

  db.query(`SELECT club_id FROM equipos WHERE id = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ message: "Equipo no encontrado" });

    const clubId = rows[0].club_id;

    // Quitar ese entrenador de otro equipo
    db.query(`UPDATE usuarios SET equipo_id = NULL WHERE DNI = ? AND Rol='entrenador'`, [entrenador], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Asignarlo SOLO si pertenece al club
      db.query(
        `UPDATE usuarios SET equipo_id = ?
         WHERE DNI = ? AND Rol='entrenador' AND club_id = ?`,
        [id, entrenador, clubId],
        (err3, result) => {
          if (err3) return res.status(500).json({ error: err3.message });
          if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Ese entrenador no pertenece al club del equipo" });
          }
          res.json({ message: "Entrenador asignado correctamente" });
        }
      );
    });
  });
};


export const moverJugador = (req, res) => {
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

export const quitarEntrenadorEquipo = (req, res) => {
  const { dni } = req.body;

  if (!dni) {
    return res.status(400).json({ message: 'DNI requerido' });
  }

  db.query(
    `UPDATE usuarios 
     SET equipo_id = NULL 
     WHERE DNI = ? AND Rol = 'entrenador'`,
    [dni],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Entrenador no encontrado' });
      }

      res.json({ message: 'Entrenador quitado del equipo' });
    }
  );
};

