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

router.get("/", authenticateToken, getAllProjects);
router.post("/", authenticateToken, requireRole(["manager"]), createProject);
router.put("/:id", authenticateToken, requireRole(["manager"]), updateProject);
router.delete("/:id", authenticateToken, requireRole(["manager"]), deleteProject);

export default router;
