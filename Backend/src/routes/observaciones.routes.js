import express from "express";
import {
  crearObservacion,
  getObservacionesPorJugador,
} from "../controllers/observaciones.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// En observaciones.routes.js, añade temporalmente antes de las rutas:
router.use((req, res, next) => {
  console.log("OBSERVACIONES - Header:", req.headers.authorization);
  next();
});

router.post("/", authMiddleware, crearObservacion);
// observaciones.routes.js
router.get(
  "/jugador/:dni",
  (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.json([]);
    next();
  },
  authMiddleware,
  getObservacionesPorJugador
);

export default router;
