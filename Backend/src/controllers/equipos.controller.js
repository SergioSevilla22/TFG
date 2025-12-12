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

        /* ------------- Obtener entrenador ------------- */
        db.query(
          `SELECT DNI, nombre, foto 
           FROM usuarios 
           WHERE equipo_id = ? AND Rol = 'entrenador' LIMIT 1`,
          [id],
          (err3, entrenadores) => {

            if (err3) return res.status(500).json({ error: err3.message });

            const entrenador = entrenadores[0] || null;

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
              entrenador,
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
  const { id } = req.params;
  const { entrenador } = req.body; // DNI

  if (!entrenador) {
    return res.status(400).json({ message: "DNI del entrenador requerido" });
  }

  // Quitar ese entrenador de otro equipo
  db.query(
    `UPDATE usuarios SET equipo_id = NULL WHERE DNI = ?`,
    [entrenador],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Asignarlo al nuevo equipo
      db.query(
        `UPDATE usuarios SET equipo_id = ? WHERE DNI = ? AND Rol = 'entrenador'`,
        [id, entrenador],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          return res.json({ message: "Entrenador asignado correctamente" });
        }
      );
    }
  );
};

/* ===============================================
    4. Mover jugador entre equipos (Drag & Drop)
================================================ */

export const moverJugador = (req, res) => {
  const { jugador, nuevoEquipoId } = req.body; // jugador = DNI

  if (!jugador || !nuevoEquipoId) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  db.query(
    `UPDATE usuarios SET equipo_id = ? WHERE DNI = ? AND Rol = 'jugador'`,
    [nuevoEquipoId, jugador],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Jugador movido correctamente" });
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
