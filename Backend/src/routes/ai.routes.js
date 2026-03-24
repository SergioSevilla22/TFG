import express from "express";
import {
  getAIPlayerAnalysis,
  getAIAttendance,
  getAIClusteringAnalysis,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/player/:dni", getAIPlayerAnalysis);
router.get("/attendance/:dni", getAIAttendance);
router.get("/clustering/:dni", getAIClusteringAnalysis);

export default router;
