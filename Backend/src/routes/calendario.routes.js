import express from "express";
import {
  obtenerCalendarioEquipo,
  obtenerCalendarioJugador,
  obtenerCalendarioClub,
  obtenerICalEquipo,
  obtenerICalJugador,
  obtenerICalClub
} from "../controllers/calendario.controller.js";

const router = express.Router();

/* JSON */
router.get("/equipo/:equipoId", obtenerCalendarioEquipo);
router.get("/jugador/:dni", obtenerCalendarioJugador);
router.get("/club/:clubId", obtenerCalendarioClub);

/* iCal (.ics) */
router.get("/equipo/:equipoId/ical", obtenerICalEquipo);
router.get("/jugador/:dni/ical", obtenerICalJugador);
router.get("/club/:clubId/ical", obtenerICalClub);

export default router;
