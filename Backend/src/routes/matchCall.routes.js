import express from "express";
import {
  createMatchCall,
  getMatchCallsByTeam,
  respondMatchCall,
  sendReminder,
  editMatchCall,
  deleteMatchCall,
} from "../controllers/matchCall.controller.js";

const router = express.Router();

router.post("/", createMatchCall);
router.get("/equipo/:equipoId", getMatchCallsByTeam);
router.post("/:id/responder", respondMatchCall);
router.post("/:id/recordatorio", sendReminder);
router.put("/:id", editMatchCall);
router.delete("/:id", deleteMatchCall);

export default router;
