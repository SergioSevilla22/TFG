import { db } from "../db.js";

export const createObservation = (req, res) => {
  const { dnis, equipo_id, titulo, contenido, categoria, visibilidad } =
    req.body;
  const autor_dni = req.user.DNI; // Comes from authMiddleware

  if (
    !dnis ||
    !Array.isArray(dnis) ||
    dnis.length === 0 ||
    !contenido ||
    !titulo
  ) {
    return res
      .status(400)
      .json({
        message: "Faltan campos obligatorios o formato de DNIS incorrecto",
      });
  }

  // Prepare bulk insert
  const values = dnis.map((dni) => [
    autor_dni,
    dni,
    equipo_id,
    titulo,
    contenido,
    categoria || "general",
    visibilidad || "jugador",
  ]);

  const sql = `INSERT INTO observaciones 
    (autor_dni, jugador_dni, equipo_id, titulo, contenido, categoria, visibilidad) 
    VALUES ?`;

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: `Observación registrada correctamente para ${result.affectedRows} jugadores.`,
      insertedCount: result.affectedRows,
    });
  });
};

export const getObservationsByPlayer = (req, res) => {
  const { dni } = req.params;
  const userRole = req.user.Rol;
  const userDni = req.user.DNI;

  let sql = `
    SELECT o.*, u.nombre as nombre_autor, u.foto as foto_autor
    FROM observaciones o
    JOIN usuarios u ON o.autor_dni = u.DNI
    WHERE o.jugador_dni = ?
  `;

  // Privacy filters
  if (userRole === "jugador") {
    sql += " AND o.visibilidad = 'jugador'";
  } else if (userRole === "tutor") {
    sql += " AND o.visibilidad = 'jugador'";
  } else if (userRole === "entrenador" && userDni !== dni) {
    // A coach sees what is visible to the player or club level (or if they are the author)
    sql += ` AND (o.visibilidad IN ('jugador', 'club') OR o.autor_dni = '${userDni}')`;
  }

  sql += " ORDER BY o.fecha DESC";

  db.query(sql, [dni], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
