import express from "express";
import multer from "multer";

import {
  crearClub,
  obtenerClubes,
  obtenerClub,
  actualizarClub,
  eliminarClub,
  obtenerJugadoresClub,
  obtenerEntrenadoresClub,
  obtenerResumenClub
} from "../controllers/club.controller.js";

import { registerUsuariosMasivoAdminClub } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdminPlataforma, requireAdminClub } from "../middlewares/roles.middleware.js";

const router = express.Router();

// ---------- MULTER ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

/* ======================================================
   CRUD CLUBES → SOLO ADMIN PLATAFORMA
====================================================== */

router.post(
  "/clubes",
  authMiddleware,
  requireAdminPlataforma,
  upload.single("escudo"),
  crearClub
);

router.get(
  "/clubes",
  authMiddleware,
  (req, res, next) => {
    if (
      req.user.Rol === 'admin_plataforma' ||
      req.user.Rol === 'admin_club'
    ) {
      return next();
    }
    return res.status(403).json({ message: "Acceso denegado" });
  },
  obtenerClubes
);

router.get(
  "/clubes/:id",
  authMiddleware,
  (req, res, next) => {
    if (
      req.user.Rol === 'admin_plataforma' ||
      (req.user.Rol === 'admin_club' && req.user.club_id == req.params.id)
    ) {
      return next();
    }
    return res.status(403).json({ message: "Acceso denegado" });
  },
  obtenerClub
);

router.put(
  "/clubes/:id",
  authMiddleware,
  requireAdminPlataforma,
  upload.single("escudo"),
  actualizarClub
);

router.delete(
  "/clubes/:id",
  authMiddleware,
  requireAdminPlataforma,
  eliminarClub
);

/* ======================================================
   CONSULTAS CLUB → ADMIN CLUB (SOLO SU CLUB)
====================================================== */

router.get(
  "/clubes/:id/jugadores",
  authMiddleware,
  requireAdminClub,
  (req, res, next) => {
    if (req.user.club_id != req.params.id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  },
  obtenerJugadoresClub
);

router.get(
  "/clubes/:id/entrenadores",
  authMiddleware,
  requireAdminClub,
  (req, res, next) => {
    if (req.user.club_id != req.params.id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  },
  obtenerEntrenadoresClub
);

router.get(
  "/clubes/:id/resumen",
  authMiddleware,
  requireAdminClub,
  (req, res, next) => {
    if (req.user.club_id != req.params.id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  },
  obtenerResumenClub
);

/* ======================================================
   REGISTRO MASIVO → ADMIN CLUB
====================================================== */

router.post(
  "/clubes/register-massive",
  authMiddleware,
  requireAdminClub,
  upload.single("file"),
  registerUsuariosMasivoAdminClub
);

export default router;
