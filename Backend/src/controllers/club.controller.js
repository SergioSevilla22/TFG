import { db } from "../db.js";

export const crearClub = (req, res) => {
  const { nombre, telefono, email, direccion, poblacion, provincia, codigo_postal } = req.body;
  const escudo = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });

  db.query(
    `INSERT INTO clubes (nombre, telefono, email, direccion, poblacion, provincia, codigo_postal, escudo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, telefono, email, direccion, poblacion, provincia, codigo_postal, escudo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ message: "Club creado correctamente", id: result.insertId });
    }
  );
};

export const obtenerClubes = (req, res) => {
  db.query("SELECT * FROM clubes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const obtenerClub = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM clubes WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Club no encontrado" });

    res.json(results[0]);
  });
};

export const actualizarClub = (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion, poblacion, provincia, codigo_postal } = req.body;
  const escudo = req.file ? `/uploads/${req.file.filename}` : null;

  const updateFields = [];
  const params = [];

  if (nombre) { updateFields.push("nombre = ?"); params.push(nombre); }
  if (telefono) { updateFields.push("telefono = ?"); params.push(telefono); }
  if (email) { updateFields.push("email = ?"); params.push(email); }
  if (direccion) { updateFields.push("direccion = ?"); params.push(direccion); }
  if (poblacion) { updateFields.push("poblacion = ?"); params.push(poblacion); }
  if (provincia) { updateFields.push("provincia = ?"); params.push(provincia); }
  if (codigo_postal) { updateFields.push("codigo_postal = ?"); params.push(codigo_postal); }
  if (escudo) { updateFields.push("escudo = ?"); params.push(escudo); }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No hay datos para actualizar" });
  }

  params.push(id);

  db.query(`UPDATE clubes SET ${updateFields.join(", ")} WHERE id = ?`, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Club actualizado correctamente" });
  });
};

export const eliminarClub = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM clubes WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Club eliminado" });
  });
};

export const obtenerJugadoresClub = (req, res) => {
  const { id } = req.params; // clubId

  db.query(
    `SELECT u.DNI, u.nombre, u.equipo_id, e.nombre AS equipo_nombre
     FROM usuarios u
     LEFT JOIN equipos e ON e.id = u.equipo_id
     WHERE u.Rol = 'jugador' AND u.club_id = ?
     ORDER BY u.nombre ASC`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

export const asignarJugadoresAClub = (req, res) => {
  const { id } = req.params; // clubId
  const { jugadores } = req.body; // array de DNIs

  if (!Array.isArray(jugadores) || jugadores.length === 0) {
    return res.status(400).json({ message: "jugadores debe ser un array con DNIs" });
  }

  db.query(
    `UPDATE usuarios
     SET club_id = ?, equipo_id = NULL
     WHERE Rol = 'jugador' AND DNI IN (?)`,
    [id, jugadores],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Jugadores añadidos al club", afectados: result.affectedRows });
    }
  );
};

// 3) Quitar jugador del club (lo saca del club y del equipo)
export const quitarJugadorDeClub = (req, res) => {
  const { id, dni } = req.params; // clubId, DNI

  db.query(
    `UPDATE usuarios
     SET club_id = NULL, equipo_id = NULL
     WHERE Rol = 'jugador' AND DNI = ? AND club_id = ?`,
    [dni, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Jugador no pertenece a este club" });
      res.json({ message: "Jugador quitado del club" });
    }
  );
};
