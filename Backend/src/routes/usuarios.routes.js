import express from "express";
import { buscarJugadoresGlobal, buscarEntrenadoresGlobal} from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/jugadores/buscar", buscarJugadoresGlobal);
router.get("/entrenadores/buscar", buscarEntrenadoresGlobal);


export default router;
