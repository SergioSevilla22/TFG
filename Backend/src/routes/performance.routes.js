import express from "express";
import {
  getTrainingPerformance,
  saveTrainingPerformance,
} from "../controllers/performance.controller.js";

const router = express.Router();

router.get("/:id", getTrainingPerformance);
router.post("/:id", saveTrainingPerformance);

export default router;
