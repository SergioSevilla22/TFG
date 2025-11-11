import express from "express";
import multer from "multer";
import path from 'path';
import { loginUsuario, registerUsuario, registerUsuariosMasivo, solicitarRecuperacion, restablecerPassword,aceptarInvitacion, actualizarUsuario } from "../controllers/auth.controller.js";

const router = express.Router();

// 📁 Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Guarda las imágenes en public/uploads
  },
  filename: (req, file, cb) => {
    // Le pone un nombre único: fecha + nombre original
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// 👇 Este middleware manejará la subida de archivos (ej: fotoPerfil)
const upload = multer({ storage });

router.post("/login", loginUsuario);
router.post("/register", registerUsuario);
router.post("/register-massive", upload.single("file"), registerUsuariosMasivo);
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);
router.post("/accept-invitation", aceptarInvitacion);
router.put("/update-user", upload.single("fotoPerfil"), actualizarUsuario);

export default router;
