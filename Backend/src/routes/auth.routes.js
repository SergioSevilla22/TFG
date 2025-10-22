import express from "express";
import multer from "multer";
import { loginUsuario, registerUsuario, registerUsuariosMasivo, solicitarRecuperacion, restablecerPassword } from "../controllers/auth.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/login", loginUsuario);
router.post("/register", registerUsuario);
router.post("/register-massive", upload.single("file"), registerUsuariosMasivo);
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);

export default router;
