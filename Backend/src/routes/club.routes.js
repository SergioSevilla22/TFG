import express from "express";
import multer from "multer";

import {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
  getClubPlayers,
  getClubCoaches,
  getClubSummary,
  getClubPlayersByCategory,
} from "../controllers/club.controller.js";

import { bulkRegisterClubAdminUsers } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  requireAdminPlataforma,
  requireAdminClub,
  requireGestionClub,
} from "../middlewares/roles.middleware.js";

const router = express.Router();

// ---------- MULTER ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ======================================================
   CLUB CRUD → ADMIN PLATAFORMA ONLY
====================================================== */

router.post(
  "/clubes",
  authMiddleware,
  requireAdminPlataforma,
  upload.single("escudo"),
  createClub
);

router.get("/clubes", authMiddleware, requireAdminClub, getClubs);

router.get("/clubes/:id", authMiddleware, requireAdminClub, getClub);

router.put(
  "/clubes/:id",
  authMiddleware,
  requireAdminClub,
  upload.single("escudo"),
  updateClub
);

router.delete(
  "/clubes/:id",
  authMiddleware,
  requireAdminPlataforma,
  deleteClub
);

/* ======================================================
   CLUB QUERIES → ADMIN CLUB (OWN CLUB ONLY)
====================================================== */

router.get(
  "/clubes/:id/jugadores",
  authMiddleware,
  requireAdminClub,
  getClubPlayers
);

router.get(
  "/clubes/:id/entrenadores",
  authMiddleware,
  requireAdminClub,
  getClubCoaches
);

router.get(
  "/clubes/:id/resumen",
  authMiddleware,
  requireGestionClub,
  getClubSummary
);

router.get(
  "/clubes/:id/jugadores-categoria",
  authMiddleware,
  requireGestionClub,
  getClubPlayersByCategory
);

/* ======================================================
   BULK REGISTER → ADMIN CLUB
====================================================== */

router.post(
  "/clubes/register-massive",
  authMiddleware,
  requireAdminClub,
  upload.single("file"),
  bulkRegisterClubAdminUsers
);

export default router;
