import { transporter } from "./src/utils/mailer.js";
import dotenv from "dotenv";
dotenv.config();

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: "sergiosevillaromero@gmail.com", 
  subject: "📧 Prueba desde ClubFútbol Control",
  text: "Hola! Este es un correo de prueba enviado con Nodemailer 🚀",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("❌ Error al enviar:", error);
  } else {
    console.log("✅ Correo enviado:", info.response);
  }
});
