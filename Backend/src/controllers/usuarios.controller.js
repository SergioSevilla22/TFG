import { db } from "../db.js";

// Obtener todos los usuarios
export const getUsuarios = (req, res) => {
  db.query("SELECT * FROM Usuarios", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener un usuario por DNI
export const getUsuarioByDni = (req, res) => {
  const { dni } = req.params;
  db.query("SELECT * FROM Usuarios WHERE DNI = ?", [dni], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(results[0]);
  });
};

// Crear un nuevo usuario
export const createUsuario = (req, res) => {
  const { DNI, Rol = "j", email, telefono } = req.body;
  if (!DNI || !email || !telefono)
    return res.status(400).json({ message: "Faltan datos obligatorios" });

  db.query(
    "INSERT INTO Usuarios (DNI, Rol, email, telefono) VALUES (?, ?, ?, ?)",
    [DNI, Rol, email, telefono],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Usuario creado correctamente" });
    }
  );
};

// Eliminar usuario
export const deleteUsuario = (req, res) => {
  const { dni } = req.params;
  db.query("DELETE FROM Usuarios WHERE DNI = ?", [dni], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  });
};
