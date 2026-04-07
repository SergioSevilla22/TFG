import express from "express";
import {
  createEvent,
  getEventsByTeam,
  respondToEvent,
  sendEventReminder,
  deleteEvent,
  editEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.post("/", createEvent);
router.get("/equipo/:equipoId", getEventsByTeam);
router.post("/:id/responder", respondToEvent);
router.post("/:id/recordatorio", sendEventReminder);
router.delete("/:id", deleteEvent);
router.put("/:id", editEvent);

export default router;
