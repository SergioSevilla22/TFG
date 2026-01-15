import express from "express";
import multer from "multer";
import path from "path";

import {
  loginUsuario,
  solicitarRecuperacion,
  restablecerPassword,
  aceptarInvitacion,
  actualizarUsuario,
  cambiarPassword,
  deleteUsuario,
  getUsuario,
  updateRolUsuario,
  registerUsuarioAdminClub
} from "../controllers/auth.controller.js";

import {
  registrarDependiente,
  obtenerDependientes,
  quitarVinculo
} from "../controllers/tutor.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdminClub } from "../middlewares/roles.middleware.js";

const router = express.Router();

// ---------- MULTER ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------- AUTH ----------
router.post("/login", loginUsuario);
router.post("/forgot-password", solicitarRecuperacion);
router.post("/reset-password", restablecerPassword);
router.post("/accept-invitation", aceptarInvitacion);
router.post(
  "/club-admin/register-user",
  authMiddleware,
  requireAdminClub,
  registerUsuarioAdminClub
);

// ---------- PERFIL USUARIO ----------
router.put("/update-user", upload.single("fotoPerfil"), actualizarUsuario);
router.post("/change-password", cambiarPassword);
router.delete("/delete-user", deleteUsuario);
router.get("/get-user", getUsuario);
router.put("/update-role", updateRolUsuario);

// ---------- TUTOR ----------
router.post("/tutor/registrar-dependiente", registrarDependiente);
router.get("/tutor/dependientes", obtenerDependientes);
router.put("/tutor/quitar-vinculo", quitarVinculo);

export default router;
