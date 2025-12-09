import express from "express";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from "../controllers/categoria.controller.js";

const router = express.Router();

router.get("/categorias", obtenerCategorias);
router.post("/categorias", crearCategoria);
router.put("/categorias/:id", actualizarCategoria);
router.delete("/categorias/:id", eliminarCategoria);

export default router;
