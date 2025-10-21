import express from "express";
import multer from "multer";
import { loginUsuario, registerUsuario, registerUsuariosMasivo } from "../controllers/auth.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/login", loginUsuario);
router.post("/register", registerUsuario);
router.post("/register-massive", upload.single("file"), registerUsuariosMasivo);

export default router;
