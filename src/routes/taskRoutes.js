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

router.get("/", authenticateToken, getAllTasks);
router.post("/", authenticateToken, requireRole(["manager"]), createTask);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, requireRole(["manager"]), deleteTask);

export default router;
