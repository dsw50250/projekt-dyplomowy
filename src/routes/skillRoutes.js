import express from "express";
import {
  createSkill,
  getAllSkills,
  getMySkills,
  addMySkills,
  removeMySkill
} from "../controllers/skillController.js";

import { authenticateToken } from "../middlewares/auth.js"; // <- твой auth.js

const router = express.Router();

// Все маршруты защищены JWT
router.use(authenticateToken);

router.post("/", createSkill);               // добавить новый навык (для админа/менеджера)
router.get("/", getAllSkills);               // получить все навыки
router.get("/me", getMySkills);             // мои навыки
router.post("/me", addMySkills);            // добавить навыки себе
router.delete("/me/:skillId", removeMySkill); // удалить навык у себя

export default router;
