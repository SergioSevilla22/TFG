import express from "express";
import {
  getTeamCalendar,
  getPlayerCalendar,
  getClubCalendar,
  getTeamICal,
  getPlayerICal,
  getClubICal,
} from "../controllers/calendar.controller.js";

const router = express.Router();

/* JSON */
router.get("/equipo/:equipoId", getTeamCalendar);
router.get("/jugador/:dni", getPlayerCalendar);
router.get("/club/:clubId", getClubCalendar);

/* iCal (.ics) */
router.get("/equipo/:equipoId/ical", getTeamICal);
router.get("/jugador/:dni/ical", getPlayerICal);
router.get("/club/:clubId/ical", getClubICal);

export default router;
