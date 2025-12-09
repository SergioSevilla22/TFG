import express from "express";
import {
  obtenerTemporadas,
  crearTemporada,
  activarTemporada,
  eliminarTemporada
} from "../controllers/temporada.controller.js";

const router = express.Router();

router.get("/temporadas", obtenerTemporadas);
router.post("/temporadas", crearTemporada);
router.put("/temporadas/activar/:id", activarTemporada);
router.delete("/temporadas/:id", eliminarTemporada);

export default router;
