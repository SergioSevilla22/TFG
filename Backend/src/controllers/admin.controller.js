import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../utils/mailer.js";


export const registerUsuarioAdminPlataforma = (req, res) => {
    const { DNI, nombre, email, telefono, Rol, club_id } = req.body;
  
    if (!DNI || !nombre || !email || !telefono || !Rol) {
      return res.status(400).json({ message: "Campos obligatorios" });
    }
  
    if (Rol !== "admin_plataforma" && !club_id) {
      return res.status(400).json({
        message: "El club es obligatorio para este rol"
      });
    }
  
    const invitationToken = uuidv4();
    const invitationExp = Date.now() + 1000 * 60 * 60 * 48;
  
    db.query(
      `INSERT INTO usuarios 
       (DNI, nombre, Rol, email, telefono, club_id, invitationToken, invitationExp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [DNI, nombre, Rol, email, telefono, club_id || null, invitationToken, invitationExp],
      async (err) => {
        if (err) return res.status(500).json({ error: err.message });
  
        const inviteUrl = `http://localhost:4200/accept-invitation?token=${invitationToken}`;
  
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Activación de cuenta - ClubFútbol Control",
          html: `
            <h3>Bienvenido/a ${nombre}</h3>
            <p>Tu cuenta ha sido creada. Para activarla y establecer tu contraseña, haz clic en el siguiente enlace:</p>
            <a href="${inviteUrl}">${inviteUrl}</a>
            <p>Este enlace es válido durante 48 horas.</p>
          `
        };
  
        try {
          await transporter.sendMail(mailOptions);
          res.status(201).json({
            message: "Usuario creado y correo de activación enviado"
          });
        } catch (mailError) {
          console.error("Error enviando email:", mailError);
          res.status(201).json({
            message: "Usuario creado, pero no se pudo enviar el email"
          });
        }
      }
    );
  };
