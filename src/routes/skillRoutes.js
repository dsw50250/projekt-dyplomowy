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

// Все маршруты защищены
router.use(authenticateToken);

// Создание глобального навыка (только manager/admin)
router.post("/", createSkill);

// Получение всех навыков (для выбора)
router.get("/", getAllSkills);

// Навыки текущего пользователя
router.get("/me", getMySkills);
router.post("/me", addMySkills);
router.delete("/me/:skillId", removeMySkill);

// Навыки любого пользователя (только manager/admin)
router.get("/user/:userId", getUserSkills);

export default router;
