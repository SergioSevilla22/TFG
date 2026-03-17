import express from "express";
import {
  getAIPlayerAnalysis,
  getAIAttendance,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/player/:dni", getAIPlayerAnalysis);
router.get("/attendance/:dni", getAIAttendance);

export default router;
