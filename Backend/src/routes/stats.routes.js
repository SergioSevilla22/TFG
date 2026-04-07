import express from "express";
import {
  getMatchCallStats,
  saveMatchCallStats,
  getPlayerTotals,
  getPlayerMatchCallStats,
} from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/convocatoria/:id", getMatchCallStats);
router.post("/convocatoria/:id", saveMatchCallStats);
router.get("/jugador/:dni", getPlayerTotals);
router.get(
  "/convocatoria/:convocatoriaId/jugador/:dni",
  getPlayerMatchCallStats
);

export default router;
