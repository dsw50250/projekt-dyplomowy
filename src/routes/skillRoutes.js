import express from "express";
import {
  createSkill,
  getAllSkills,
  getMySkills,
  getUserSkills,
  addMySkills,
  removeMySkill
} from "../controllers/skillController.js";

import { authenticateToken, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticateToken); 

router.post("/", createSkill);
router.get("/", getAllSkills);

router.get("/me", getMySkills);

router.post("/me", requireRole(['admin', 'developer']), addMySkills);
router.delete("/me/:skillId", requireRole(['admin', 'developer']), removeMySkill);

router.get("/user/:userId", getUserSkills);

export default router;