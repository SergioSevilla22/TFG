import express from "express";
import {
  crearConvocatoria,
  obtenerConvocatoriasPorEquipo,
  responderConvocatoria,
  enviarRecordatorio
} from "../controllers/convocatorias.controller.js";

const router = express.Router();

router.post("/", crearConvocatoria);
router.get("/equipo/:equipoId", obtenerConvocatoriasPorEquipo);
router.post("/:id/responder", responderConvocatoria);
router.post("/:id/recordatorio", enviarRecordatorio);

export default router;
