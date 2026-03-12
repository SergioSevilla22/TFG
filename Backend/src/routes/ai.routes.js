import express from "express";
import { getAIPlayerAnalysis } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/player/:dni", getAIPlayerAnalysis);

export default router;
