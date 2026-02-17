import express from "express";
import {
  getEstadisticasConvocatoria,
  guardarEstadisticasConvocatoria,
  getTotalesJugador
} from "../controllers/estadisticas.controller.js";

const router = express.Router();

router.get("/convocatoria/:id", getEstadisticasConvocatoria);
router.post("/convocatoria/:id", guardarEstadisticasConvocatoria);
router.get("/jugador/:dni", getTotalesJugador);

export default router;
