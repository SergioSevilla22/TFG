import express from "express";
import {
  obtenerEquiposPorClub,
  crearEquipo,
  eliminarEquipo,
} from "../controllers/equipos.controller.js";

const router = express.Router();

router.get("/equipos/club/:clubId", obtenerEquiposPorClub);
router.post("/equipos", crearEquipo);
router.delete("/equipos/:id", eliminarEquipo);

export default router;
