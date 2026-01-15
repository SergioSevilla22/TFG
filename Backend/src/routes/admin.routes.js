import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdminPlataforma } from "../middlewares/roles.middleware.js";
import { registerUsuarioAdminPlataforma } from "../controllers/admin.controller.js";

const router = express.Router();

router.post(
  "/register-user",
  authMiddleware,
  requireAdminPlataforma,
  registerUsuarioAdminPlataforma
);

export default router;
