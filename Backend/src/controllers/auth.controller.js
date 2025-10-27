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
  const { DNI, email, Rol, telefono } = req.body;

  if (!email || !DNI || !telefono) {
    return res.status(400).json({ message: "DNI, email y teléfono son obligatorios" });
  }

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: "El usuario ya está registrado" });
    }

    try {
      const invitationToken = uuidv4();
      const invitationExp = Date.now() + 1000 * 60 * 60 * 48; // 48h

      db.query(
        "INSERT INTO usuarios (DNI, Rol, email, telefono, invitationToken, invitationExp) VALUES (?, ?, ?, ?, ?, ?)",
        [DNI, Rol || "usuario", email, telefono, invitationToken, invitationExp],
        async (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // 🔹 Enviar correo con enlace de invitación
          const invitationUrl = `http://localhost:4200/accept-invitation?token=${invitationToken}`;
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Invitación para unirte a ClubFútbol Control",
            html: `
              <h3>¡Te han invitado al Club!</h3>
              <p>Haz clic en el siguiente enlace para crear tu contraseña y activar tu cuenta:</p>
              <a href="${invitationUrl}">${invitationUrl}</a>
              <p>Este enlace es válido por 48 horas.</p>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            res.status(201).json({
              message: `Usuario invitado correctamente. Correo enviado a ${email}`
            });
          } catch (mailError) {
            res.status(500).json({ error: "Usuario creado, pero error al enviar correo", mailError });
          }
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export const aceptarInvitacion = (req, res) => {
  const { token, password } = req.body;

  if (!token || !password)
    return res.status(400).json({ message: "Token y contraseña son obligatorios" });

  db.query("SELECT * FROM usuarios WHERE invitationToken = ?", [token], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Invitación no válida o ya usada" });

    const user = results[0];
    if (Date.now() > user.invitationExp)
      return res.status(400).json({ message: "El enlace de invitación ha expirado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "UPDATE usuarios SET password = ?, invitationToken = NULL, invitationExp = NULL WHERE email = ?",
      [hashedPassword, user.email],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cuenta activada correctamente. Ya puedes iniciar sesión." });
      }
    );
  });
};

export const registerUsuariosMasivo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo" });
  }

  const filePath = req.file.path;
  const usuarios = [];
  const skippedUsers = [];
  const invitedUsers = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      usuarios.push(row);
    })
    .on("end", async () => {
      try {
        for (const u of usuarios) {
          const { DNI, email, telefono, Rol } = u;

          if (!DNI || !email || !telefono) {
            console.log("Fila incompleta:", u);
            skippedUsers.push({ ...u, reason: "Fila incompleta" });
            continue;
          }

          // Verificar si el usuario ya existe
          const exists = await new Promise((resolve, reject) => {
            db.query(
              "SELECT * FROM usuarios WHERE email = ? OR DNI = ?",
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

          // Crear token de invitación (válido 48h)
          const invitationToken = uuidv4();
          const invitationExp = Date.now() + 1000 * 60 * 60 * 48;

          // Insertar usuario sin contraseña
          await new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO usuarios (DNI, Rol, email, telefono, invitationToken, invitationExp) VALUES (?, ?, ?, ?, ?, ?)",
              [DNI, Rol || "usuario", email, telefono, invitationToken, invitationExp],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });

          // Enviar correo de invitación
          const invitationUrl = `http://localhost:4200/accept-invitation?token=${invitationToken}`;
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Invitación para unirte a ClubFútbol Control",
            html: `
              <h3>¡Bienvenido al Club!</h3>
              <p>Has sido invitado a unirte al sistema del club.</p>
              <p>Haz clic en el siguiente enlace para crear tu contraseña y activar tu cuenta (válido por 48h):</p>
              <a href="${invitationUrl}">${invitationUrl}</a>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            invitedUsers.push(email);
          } catch (mailError) {
            console.error("❌ Error al enviar correo a:", email, mailError);
            skippedUsers.push({ ...u, reason: "Error al enviar correo" });
          }
        }

        // Eliminar el archivo temporal CSV
        fs.unlinkSync(filePath);

        res.status(201).json({
          message: `Invitaciones enviadas: ${invitedUsers.length}, Omitidos: ${skippedUsers.length}`,
          invitedUsers,
          skippedUsers
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
