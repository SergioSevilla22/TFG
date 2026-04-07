import express from "express";
import {
  createObservation,
  getObservationsByPlayer,
} from "../controllers/observations.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("OBSERVACIONES - Header:", req.headers.authorization);
  next();
});

router.post("/", authMiddleware, createObservation);
router.get(
  "/jugador/:dni",
  (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.json([]);
    next();
  },
  authMiddleware,
  getObservationsByPlayer
);

export default router;
