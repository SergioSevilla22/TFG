import express from "express";
import { crearEvento, obtenerEventosPorEquipo, responderEvento, enviarRecordatorioEvento, eliminarEvento,editarEvento } from "../controllers/eventos.controller.js";


const router = express.Router();

router.post("/", crearEvento);
router.get("/equipo/:equipoId", obtenerEventosPorEquipo);
router.post("/:id/responder", responderEvento);
router.post("/:id/recordatorio", enviarRecordatorioEvento);
router.delete("/:id", eliminarEvento);
router.put("/:id", editarEvento);

export default router;
