import express from "express";
import multer from "multer";
import path from "path";
import {
  loginUsuario,
  registerUsuario,
  registerUsuariosMasivo,
  solicitarRecuperacion,
  restablecerPassword,
  aceptarInvitacion,
  actualizarUsuario,
  cambiarPassword,
  deleteUsuario,
  getUsuario,
  updateRolUsuario,
} from "../controllers/auth.controller.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/login", loginUsuario);
router.post("/register", registerUsuario);
router.post("/register-massive", upload.single("file"), registerUsuariosMasivo);
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);
router.post("/accept-invitation", aceptarInvitacion);
router.put("/update-user", upload.single("fotoPerfil"), actualizarUsuario);
router.post("/change-password", cambiarPassword);
router.delete("/delete-user", deleteUsuario);
router.get("/get-user", getUsuario);
router.put("/update-role", updateRolUsuario)

export default router;
