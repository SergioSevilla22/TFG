import express from "express";
import {
  getTeamsByClub,
  createTeam,
  deleteTeam,
  getTeamById,
  assignPlayers,
  assignCoach,
  movePlayer,
  removeCoachFromTeam,
} from "../controllers/team.controller.js";

const router = express.Router();

router.get("/equipos/club/:clubId", getTeamsByClub);
router.get("/equipos/:id", getTeamById);

router.post("/equipos", createTeam);
router.delete("/equipos/:id", deleteTeam);

router.put("/equipos/:id/asignar-jugadores", assignPlayers);
router.put("/equipos/:id/asignar-entrenador", assignCoach);
router.put("/equipos/mover-jugador", movePlayer);
router.put("/equipos/quitar-entrenador", removeCoachFromTeam);

export default router;
