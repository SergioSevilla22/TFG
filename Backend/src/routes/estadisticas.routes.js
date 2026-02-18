import express from "express";
import {
  getEstadisticasConvocatoria,
  guardarEstadisticasConvocatoria,
  getTotalesJugador,
  getEstadisticasJugadorConvocatoria
} from "../controllers/estadisticas.controller.js";

const router = express.Router();

router.get("/convocatoria/:id", getEstadisticasConvocatoria);
router.post("/convocatoria/:id", guardarEstadisticasConvocatoria);
router.get("/jugador/:dni", getTotalesJugador);
router.get(
  "/convocatoria/:convocatoriaId/jugador/:dni",
  getEstadisticasJugadorConvocatoria
);


export default router;
