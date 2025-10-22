import { db } from "../db.js";
import bcrypt from "bcrypt";
import fs from "fs";
import csv from "csv-parser";
import { generateToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../utils/mailer.js";

// 🔐 Login de usuario
export const loginUsuario = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email y contraseña son obligatorios" });

  db.query("SELECT * FROM Usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const user = results[0];

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = generateToken(user);

      res.status(200).json({
        message: "Login correcto",
        token,
        user: { DNI: user.DNI, email: user.email, Rol: user.Rol },
      });
    } catch (error) {
      res.status(500).json({ error: "Error al validar contraseña" });
    }
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
          if (err) {
            console.error("❌ Error en registro de usuario:", err);
            return res.status(500).json({ error: err.message });
          }

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



export const solicitarRecuperacion = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "El email es obligatorio" });

  db.query("SELECT * FROM Usuarios WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "No existe un usuario con ese correo" });

    const token = uuidv4();
    const expiration = Date.now() + 1000 * 60 * 10;

    db.query(
      "UPDATE Usuarios SET resetToken = ?, resetTokenExp = ? WHERE email = ?",
      [token, expiration, email],
      async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const resetUrl = `http://localhost:4200/reset-password?token=${token}`;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Recuperación de contraseña - ClubFútbol Control",
          html: `
            <h3>Recuperar contraseña</h3>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña (válido por 10 minutos):</p>
            <a href="${resetUrl}">${resetUrl}</a>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log("✅ Correo enviado correctamente a", email);
          res.json({ message: "Correo de recuperación enviado correctamente" });
        } catch (mailError) {
          console.error("❌ Error detallado al enviar correo:", mailError);
          res.status(500).json({ error: "Error al enviar el correo", mailError });
        }
      }
    );
  });
};


export const restablecerPassword = (req, res) => {
  const { token, nuevaPassword } = req.body;
  if (!token || !nuevaPassword)
    return res.status(400).json({ message: "Token y nueva contraseña son obligatorios" });

  db.query("SELECT * FROM Usuarios WHERE resetToken = ?", [token], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Token inválido o ya utilizado" });

    const user = results[0];
    if (Date.now() > user.resetTokenExp)
      return res.status(400).json({ message: "El token ha expirado" });

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    db.query(
      "UPDATE Usuarios SET password = ?, resetToken = NULL, resetTokenExp = NULL WHERE email = ?",
      [hashedPassword, user.email],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contraseña actualizada correctamente" });
      }
    );
  });
};
