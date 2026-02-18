import express from "express";
import {
  getRendimientoEntrenamiento,
  guardarRendimientoEntrenamiento
} from "../controllers/rendimiento.controller.js";

const router = express.Router();

router.get("/:id", getRendimientoEntrenamiento);
router.post("/:id", guardarRendimientoEntrenamiento);

export default router;
