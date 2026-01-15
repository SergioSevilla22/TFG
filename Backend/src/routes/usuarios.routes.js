import express from "express";
import { buscarJugadoresGlobal, buscarEntrenadoresGlobal, traspasarUsuario, eliminarUsuarioPlataforma} from "../controllers/usuarios.controller.js";

const router = express.Router();

router.get("/jugadores/buscar", buscarJugadoresGlobal);
router.get("/entrenadores/buscar", buscarEntrenadoresGlobal);
// PUT /api/usuarios/:dni/traspaso
router.put("/:dni/traspaso", traspasarUsuario);

// DELETE /api/usuarios/:dni
router.delete("/:dni", eliminarUsuarioPlataforma);


export default router;
