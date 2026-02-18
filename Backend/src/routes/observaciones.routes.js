import express from "express";
import { crearObservacion, getObservacionesPorJugador } from "../controllers/observaciones.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, crearObservacion);
router.get("/jugador/:dni", authMiddleware, getObservacionesPorJugador);

export default router;