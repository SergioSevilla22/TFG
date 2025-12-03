import express from "express";
import multer from "multer";
import {
  crearClub,
  obtenerClubes,
  obtenerClub,
  actualizarClub,
  eliminarClub,
} from "../controllers/club.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// CRUD Clubes
router.post("/clubes", upload.single("escudo"), crearClub);
router.get("/clubes", obtenerClubes);
router.get("/clubes/:id", obtenerClub);
router.put("/clubes/:id", upload.single("escudo"), actualizarClub);
router.delete("/clubes/:id", eliminarClub);

export default router;
