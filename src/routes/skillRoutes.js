import express from "express";
import {
  createSkill,
  getAllSkills,
  getMySkills,
  getUserSkills,
  addMySkills,
  removeMySkill
} from "../controllers/skillController.js";

import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticateToken);
router.post("/", createSkill);
router.get("/", getAllSkills);
router.get("/me", getMySkills);
router.post("/me", addMySkills);
router.delete("/me/:skillId", removeMySkill);
router.get("/user/:userId", getUserSkills);

export default router;
