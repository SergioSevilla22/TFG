import express from "express";
import {
  searchPlayersGlobal,
  searchCoachesGlobal,
  transferUser,
  deletePlatformUser,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/search/players", searchPlayersGlobal);
router.get("/search/coaches", searchCoachesGlobal);
router.put("/:dni/traspaso", transferUser);
router.delete("/:dni", deletePlatformUser);

export default router;
