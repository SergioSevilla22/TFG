import { Router } from "express";
import {
  listarJugadores,
  crearJugador,
  actualizarEstadisticas,
} from "../controllers/jugadores.controller.js";

const router = Router();

router.get("/", listarJugadores);
router.post("/", crearJugador);
router.patch("/:dni", actualizarEstadisticas);

export default router;
