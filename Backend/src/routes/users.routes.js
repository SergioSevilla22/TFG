import express from "express";
import {
  getSeasons,
  createSeason,
  activateSeason,
  deleteSeason,
} from "../controllers/season.controller.js";

const router = express.Router();

router.get("/temporadas", getSeasons);
router.post("/temporadas", createSeason);
router.put("/temporadas/activar/:id", activateSeason);
router.delete("/temporadas/:id", deleteSeason);

export default router;
