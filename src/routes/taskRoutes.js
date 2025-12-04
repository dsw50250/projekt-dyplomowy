import express from "express";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

import { authenticateToken } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/roles.js";

const router = express.Router();

// Получение всех задач
router.get("/", authenticateToken, getAllTasks);

// Создание задачи — только менеджер
router.post("/", authenticateToken, requireRole(["manager"]), createTask);

// Обновление задачи — только менеджер
router.put("/:id", authenticateToken, requireRole(["manager"]), updateTask);

// Удаление задачи — только менеджер
router.delete("/:id", authenticateToken, requireRole(["manager"]), deleteTask);

export default router;
