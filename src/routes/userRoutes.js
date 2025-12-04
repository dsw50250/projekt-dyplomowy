import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getDevelopers,
  getManagers
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Регистрация и логин открыты
router.post("/register", registerUser);
router.post("/login", loginUser);

router.use(authenticateToken)
// Получение пользователей (все, dev, manager)
router.get("/", getAllUsers);
router.get("/developers", getDevelopers);
router.get("/managers", getManagers);

export default router;
