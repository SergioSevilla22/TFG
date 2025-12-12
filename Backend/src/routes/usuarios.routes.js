import express from "express";
import { buscarJugadoresGlobal } from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/jugadores/buscar", buscarJugadoresGlobal);

export default router;
