import express from "express";
import {
  getUsuarios,
  getUsuarioByDni,
  createUsuario,
  deleteUsuario,
} from "../controllers/usuarios.controller.js";

const router = express.Router();

// GET → obtener todos los usuarios
router.get("/", getUsuarios);

// GET → obtener un usuario por su DNI
router.get("/:dni", getUsuarioByDni);

// POST → crear un nuevo usuario
router.post("/", createUsuario);

// DELETE → eliminar un usuario por su DNI
router.delete("/:dni", deleteUsuario);

export default router;
