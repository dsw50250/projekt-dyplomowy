import express from "express";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

import { authenticateToken } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/roles.js";

const router = express.Router();

// Получить проекты
router.get("/", authenticateToken, getAllProjects);

// Создать проект (только менеджер)
router.post("/", authenticateToken, requireRole(["manager"]), createProject);

// Обновить проект (только менеджер)
router.put("/:id", authenticateToken, requireRole(["manager"]), updateProject);

// Удалить проект (только менеджер)
router.delete("/:id", authenticateToken, requireRole(["manager"]), deleteProject);

export default router;
