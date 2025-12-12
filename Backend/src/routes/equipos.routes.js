import express from "express";
import {
  obtenerEquiposPorClub,
  crearEquipo,
  eliminarEquipo,
  obtenerEquipoPorId,
  asignarJugadores,
  asignarEntrenador,
  moverJugador
} from "../controllers/equipos.controller.js";

const router = express.Router();

router.get("/equipos/club/:clubId", obtenerEquiposPorClub);
router.get("/equipos/:id", obtenerEquipoPorId);

router.post("/equipos", crearEquipo);
router.delete("/equipos/:id", eliminarEquipo);

router.put("/equipos/:id/asignar-jugadores", asignarJugadores);
router.put("/equipos/:id/asignar-entrenador", asignarEntrenador);
router.put("/equipos/mover-jugador", moverJugador);

export default router;
