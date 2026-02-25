import express from "express";
import {
  crearConvocatoria,
  obtenerConvocatoriasPorEquipo,
  responderConvocatoria,
  enviarRecordatorio,
  editarConvocatoria,
  eliminarConvocatoria,
} from "../controllers/convocatorias.controller.js";

const router = express.Router();

router.post("/", crearConvocatoria);
router.get("/equipo/:equipoId", obtenerConvocatoriasPorEquipo);
router.post("/:id/responder", responderConvocatoria);
router.post("/:id/recordatorio", enviarRecordatorio);
router.put("/:id", editarConvocatoria);
router.delete("/:id", eliminarConvocatoria);

export default router;
