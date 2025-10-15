import { db } from "../db.js";
import bcrypt from "bcrypt";

// Login de usuario
export const loginUsuario = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email y contraseña son obligatorios" });

  db.query("SELECT * FROM Usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = results[0];

    
    if (password !== user.password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    res.status(200).json({
      message: "Login correcto",
      user: { DNI: user.DNI, email: user.email, Rol: user.Rol },
    });
  });
};

export const registerUsuario = (req, res) => {
  const { DNI, email, password, Rol, telefono } = req.body;

  if (!email || !password || !DNI || !telefono) {
    return res.status(400).json({ message: "DNI, email, teléfono y contraseña son obligatorios" });
  }

  db.query("SELECT * FROM Usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: "El usuario ya está registrado" });
    }

    try {
      // Cifrar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar el nuevo usuario con todos los campos
      db.query(
        "INSERT INTO Usuarios (DNI, Rol, email, telefono, password) VALUES (?, ?, ?, ?, ?)",
        [DNI, Rol || "usuario", email, telefono, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          res.status(201).json({
            message: "Usuario registrado correctamente",
            user: { DNI, email, telefono, Rol: Rol || "usuario" },
          });
        }
      );
    } catch (error) {
      console.log("HOLAAAAAA");
      res.status(500).json({ error: error.message });
    }
  });
};
