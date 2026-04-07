import express from "express";
import multer from "multer";
import path from "path";

import {
  loginUser,
  requestPasswordRecovery,
  resetPassword,
  acceptInvitation,
  updateUser,
  changePassword,
  deleteUser,
  getUser,
  updateUserRole,
  registerClubAdminUser,
} from "../controllers/auth.controller.js";

import {
  registerDependent,
  getDependents,
  removeLink,
} from "../controllers/tutor.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdminClub } from "../middlewares/roles.middleware.js";

const router = express.Router();

// ---------- MULTER ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------- AUTH ----------
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordRecovery);
router.post("/reset-password", resetPassword);
router.post("/accept-invitation", acceptInvitation);
router.post(
  "/club-admin/register-user",
  authMiddleware,
  requireAdminClub,
  registerClubAdminUser
);

// ---------- USER PROFILE ----------
router.put("/update-user", upload.single("fotoPerfil"), updateUser);
router.post("/change-password", changePassword);
router.delete("/delete-user", deleteUser);
router.get("/get-user", getUser);
router.put("/update-role", updateUserRole);

// ---------- TUTOR ----------
router.post("/tutor/registrar-dependiente", registerDependent);
router.get("/tutor/dependientes", getDependents);
router.put("/tutor/quitar-vinculo", removeLink);

export default router;
