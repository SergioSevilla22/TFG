import { db } from "../db.js";
import bcrypt from "bcrypt";
import fs from "fs";
import csv from "csv-parser";

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
      res.status(500).json({ error: error.message });
    }
  });
};

export const registerUsuariosMasivo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo" });
  }

  const filePath = req.file.path;
  const usuarios = [];
  const skippedUsers = [];
  const registeredUsers = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      usuarios.push(row);
    })
    .on("end", async () => {
      try {
        for (const u of usuarios) {
          const { DNI, email, telefono, password, Rol } = u;

          if (!DNI || !email || !telefono || !password) {
            console.log("Fila incompleta:", u);
            skippedUsers.push({ ...u, reason: "Fila incompleta" });
            continue;
          }

          // Verificar si el usuario ya existe
          const exists = await new Promise((resolve, reject) => {
            db.query(
              "SELECT * FROM Usuarios WHERE email = ? OR DNI = ?",
              [email, DNI],
              (err, results) => {
                if (err) reject(err);
                resolve(results.length > 0);
              }
            );
          });

          if (exists) {
            skippedUsers.push({ ...u, reason: "Usuario existente" });
            continue;
          }

          // Insertar usuario
          const hashedPassword = await bcrypt.hash(password, 10);
          await new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO Usuarios (DNI, Rol, email, telefono, password) VALUES (?, ?, ?, ?, ?)",
              [DNI, Rol || "usuario", email, telefono, hashedPassword],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          registeredUsers.push(email);
        }

        fs.unlinkSync(filePath); // eliminar archivo temporal

        res.status(201).json({
          message: `Usuarios registrados correctamente: ${registeredUsers.length}`,
          registeredUsers,
          skippedUsers, // incluye email y razón
        });
      } catch (error) {
        console.error("Error procesando CSV:", error);
        res.status(500).json({ message: "Error al procesar el archivo", error });
      }
    });
};
