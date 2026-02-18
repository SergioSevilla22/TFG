import { db } from "../db.js";

export const crearObservacion = (req, res) => {
  const { dnis, equipo_id, titulo, contenido, categoria, visibilidad } = req.body;
  const autor_dni = req.user.DNI; // Viene del authMiddleware

  if (!dnis || !Array.isArray(dnis) || dnis.length === 0 || !contenido || !titulo) {
    return res.status(400).json({ message: "Faltan campos obligatorios o formato de DNIS incorrecto" });
  }

  // Preparamos la inserción masiva
  const values = dnis.map(dni => [
    autor_dni, 
    dni, 
    equipo_id, 
    titulo, 
    contenido, 
    categoria || 'general', 
    visibilidad || 'jugador'
  ]);

  const sql = `INSERT INTO observaciones 
    (autor_dni, jugador_dni, equipo_id, titulo, contenido, categoria, visibilidad) 
    VALUES ?`;

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      message: `Observación registrada correctamente para ${result.affectedRows} jugadores.`,
      insertedCount: result.affectedRows 
    });
  });
};

export const getObservacionesPorJugador = (req, res) => {
  const { dni } = req.params;
  const userRol = req.user.Rol;
  const userDni = req.user.DNI;

  let sql = `
    SELECT o.*, u.nombre as nombre_autor, u.foto as foto_autor
    FROM observaciones o
    JOIN usuarios u ON o.autor_dni = u.DNI
    WHERE o.jugador_dni = ?
  `;

  // Filtros de privacidad
  if (userRol === 'jugador') {
    sql += " AND o.visibilidad = 'jugador'";
  } else if (userRol === 'tutor') {
    sql += " AND o.visibilidad = 'jugador'";
  } else if (userRol === 'entrenador' && userDni !== dni) {
    // Un entrenador ve lo que es para el jugador o nivel club (o si es el autor)
    sql += ` AND (o.visibilidad IN ('jugador', 'club') OR o.autor_dni = '${userDni}')`;
  }

  sql += " ORDER BY o.fecha DESC";

  db.query(sql, [dni], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};