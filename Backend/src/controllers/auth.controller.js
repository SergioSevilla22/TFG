import { db } from "../db.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import csv from "csv-parser";
import { generateToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../utils/mailer.js";
import path from "path";

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son obligatorios" });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const user = results[0];

      // 🔒 User not yet activated (invitation pending)
      if (!user.password) {
        return res.status(403).json({
          message:
            "Debes activar tu cuenta desde el email antes de iniciar sesión",
        });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = generateToken({
          DNI: user.DNI,
          Rol: user.Rol,
          club_id: user.club_id,
        });

        res.status(200).json({
          message: "Login correcto",
          token,
          user: {
            DNI: user.DNI,
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono,
            anioNacimiento: user.anio_nacimiento,
            Rol: user.Rol,
            foto: user.foto ?? null,
            idTutor: user.idTutor ?? null,
            club_id: user.club_id ?? null,
            equipo_id: user.equipo_id ?? null,
          },
        });
      } catch (error) {
        console.error("Bcrypt error:", error);
        res.status(500).json({ error: "Error al validar contraseña" });
      }
    }
  );
};

export const acceptInvitation = (req, res) => {
  const { token, password } = req.body;

  if (!token || !password)
    return res
      .status(400)
      .json({ message: "Token y contraseña son obligatorios" });

  db.query(
    "SELECT * FROM usuarios WHERE invitationToken = ?",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res
          .status(400)
          .json({ message: "Invitación no válida o ya usada" });

      const user = results[0];
      if (Date.now() > user.invitationExp)
        return res
          .status(400)
          .json({ message: "El enlace de invitación ha expirado" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE usuarios SET password = ?, invitationToken = NULL, invitationExp = NULL WHERE email = ?",
        [hashedPassword, user.email],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            message: "Cuenta activada correctamente. Ya puedes iniciar sesión.",
          });
        }
      );
    }
  );
};

export const requestPasswordRecovery = (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "El email es obligatorio" });

  db.query(
    "SELECT * FROM Usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res
          .status(404)
          .json({ message: "No existe un usuario con ese correo" });

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
            res.json({
              message: "Correo de recuperación enviado correctamente",
            });
          } catch (mailError) {
            res
              .status(500)
              .json({ error: "Error al enviar el correo", mailError });
          }
        }
      );
    }
  );
};

export const resetPassword = (req, res) => {
  const { token, nuevaPassword } = req.body;
  if (!token || !nuevaPassword)
    return res
      .status(400)
      .json({ message: "Token y nueva contraseña son obligatorios" });

  db.query(
    "SELECT * FROM Usuarios WHERE resetToken = ?",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res
          .status(400)
          .json({ message: "Token inválido o ya utilizado" });

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
    }
  );
};

export const changePassword = (req, res) => {
  const { email, actualPassword, nuevaPassword } = req.body;
  if (!email || !actualPassword || !nuevaPassword)
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });

  db.query(
    "SELECT * FROM Usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });

      const user = results[0];
      const validPassword = await bcrypt.compare(actualPassword, user.password);
      if (!validPassword)
        return res
          .status(401)
          .json({ message: "La contraseña actual no es correcta" });

      const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
      db.query(
        "UPDATE Usuarios SET password = ? WHERE email = ?",
        [hashedPassword, email],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Contraseña actualizada correctamente" });
        }
      );
    }
  );
};

export const updateUser = (req, res) => {
  const { DNI, nombre, telefono, email, Rol } = req.body;

  if (!DNI) {
    return res
      .status(400)
      .json({ message: "El DNI es obligatorio para actualizar el usuario" });
  }

  db.query("SELECT * FROM usuarios WHERE DNI = ?", [DNI], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const user = results[0];

    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
      if (user.foto) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          user.foto.replace(/^\//, "")
        );
        fs.access(oldPath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldPath, (unlinkErr) => {
              if (unlinkErr)
                console.log(
                  "⚠️ Error al eliminar la foto anterior:",
                  unlinkErr.message
                );
            });
          }
        });
      }
    }

    const updates = [];
    const params = [];
    if (nombre) {
      updates.push("nombre = ?");
      params.push(nombre);
    }
    if (telefono) {
      updates.push("telefono = ?");
      params.push(telefono);
    }
    if (email) {
      updates.push("email = ?");
      params.push(email);
    }
    if (Rol) {
      updates.push("Rol = ?");
      params.push(Rol);
    }
    if (photoPath) {
      updates.push("foto = ?");
      params.push(photoPath);
    }

    if (updates.length === 0 && !req.file) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    params.push(DNI);
    const sql = `UPDATE usuarios SET ${updates.join(", ")} WHERE DNI = ?`;

    db.query(sql, params, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(
        "SELECT DNI, nombre, telefono, email, Rol, foto FROM usuarios WHERE DNI = ?",
        [DNI],
        (err2, results2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          if (results2.length === 0)
            return res.status(404).json({ message: "Usuario no encontrado" });

          res.json({
            message: "Usuario actualizado correctamente",
            user: results2[0],
          });
        }
      );
    });
  });
};

export const deleteUser = (req, res) => {
  const { dni } = req.body;

  if (!dni) {
    return res.status(400).json({ message: "El DNI es obligatorio" });
  }

  // Check if user exists
  db.query("SELECT * FROM usuarios WHERE DNI = ?", [dni], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];

    // Delete photo if it exists
    if (user.foto) {
      const fotoPath = path.join(
        process.cwd(),
        "public",
        user.foto.replace(/^\//, "")
      );

      fs.access(fotoPath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(fotoPath, (unlinkErr) => {
            if (unlinkErr)
              console.log("⚠️ Error al eliminar la foto:", unlinkErr.message);
          });
        }
      });
    }

    // Delete user
    db.query("DELETE FROM usuarios WHERE DNI = ?", [dni], (delErr) => {
      if (delErr) return res.status(500).json({ error: delErr.message });

      res.json({
        message: `Usuario con DNI ${dni} eliminado correctamente`,
      });
    });
  });
};

export const getUser = (req, res) => {
  const { dni } = req.query;

  if (!dni) {
    return res.status(400).json({ message: "Debes proporcionar un DNI" });
  }

  const sql = `
    SELECT 
      u.DNI,
      u.nombre,
      u.email,
      u.telefono,
      u.anio_nacimiento,
      u.Rol,
      u.foto,
      u.equipo_id,
      e.nombre AS equipo_nombre
    FROM usuarios u
    LEFT JOIN equipos e ON u.equipo_id = e.id
    WHERE u.DNI = ?
  `;

  db.query(sql, [dni], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(results[0]);
  });
};

export const updateUserRole = (req, res) => {
  const { dni, nuevoRol } = req.body;

  if (!dni || !nuevoRol) {
    return res
      .status(400)
      .json({ message: "DNI y nuevo rol son obligatorios" });
  }

  db.query(
    "UPDATE usuarios SET Rol = ? WHERE DNI = ?",
    [nuevoRol, dni],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Rol actualizado correctamente" });
    }
  );
};

export const bulkRegisterClubAdminUsers = async (req, res) => {
  const club_id = req.user.club_id;

  if (!club_id) {
    return res.status(403).json({ message: "Admin club sin club asignado" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo" });
  }

  const filePath = req.file.path;
  const users = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => users.push(row))
    .on("end", async () => {
      try {
        for (const u of users) {
          const { DNI, nombre, email, telefono, Rol, anioNacimiento } = u;

          if (!DNI || !email || !telefono || !nombre || !anioNacimiento)
            continue;

          const exists = await new Promise((resolve, reject) => {
            db.query(
              "SELECT 1 FROM usuarios WHERE DNI = ? OR email = ?",
              [DNI, email],
              (err, results) =>
                err ? reject(err) : resolve(results.length > 0)
            );
          });

          if (exists) continue;

          const invitationToken = uuidv4();
          const invitationExp = Date.now() + 1000 * 60 * 60 * 48;

          await new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO usuarios 
               (DNI, nombre, Rol, email, telefono, anio_nacimiento, club_id, invitationToken, invitationExp)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                DNI,
                nombre,
                Rol,
                email,
                telefono,
                anioNacimiento,
                club_id,
                invitationToken,
                invitationExp,
              ],
              (err) => (err ? reject(err) : resolve())
            );
          });
        }

        fs.unlinkSync(filePath);
        res.json({ message: "Registro masivo completado correctamente" });
      } catch (error) {
        res.status(500).json({ message: "Error en registro masivo", error });
      }
    });
};

export const registerClubAdminUser = (req, res) => {
  const { DNI, nombre, email, telefono, anioNacimiento, Rol } = req.body;
  const club_id = req.user.club_id;

  if (!DNI || !nombre || !email || !telefono || !Rol || !anioNacimiento) {
    return res.status(400).json({ message: "Campos obligatorios" });
  }

  if (!["jugador", "entrenador", "tutor"].includes(Rol)) {
    return res.status(403).json({ message: "Rol no permitido" });
  }

  if (!club_id) {
    return res.status(403).json({ message: "Admin club sin club asignado" });
  }

  if (anioNacimiento < 1900 || anioNacimiento > new Date().getFullYear()) {
    return res.status(400).json({ message: "Año de nacimiento inválido" });
  }

  const invitationToken = uuidv4();
  const invitationExp = Date.now() + 1000 * 60 * 60 * 48;

  db.query(
    `INSERT INTO usuarios 
     (DNI, nombre, Rol, email, telefono, anio_nacimiento, club_id, invitationToken, invitationExp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DNI,
      nombre,
      Rol,
      email,
      telefono,
      anioNacimiento,
      club_id,
      invitationToken,
      invitationExp,
    ],
    async (err) => {
      if (err) return res.status(500).json({ error: err.message });

      const inviteUrl = `http://localhost:4200/accept-invitation?token=${invitationToken}`;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Activación de cuenta - ClubFútbol Control",
          html: `
            <h3>Bienvenido/a ${nombre}</h3>
            <p>Has sido dado de alta en el club.</p>
            <a href="${inviteUrl}">${inviteUrl}</a>
          `,
        });

        res.status(201).json({ message: "Usuario creado y correo enviado" });
      } catch {
        res.status(201).json({ message: "Usuario creado (email no enviado)" });
      }
    }
  );
};
