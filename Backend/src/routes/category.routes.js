import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/categorias", getCategories);
router.post("/categorias", createCategory);
router.put("/categorias/:id", updateCategory);
router.delete("/categorias/:id", deleteCategory);

export default router;
