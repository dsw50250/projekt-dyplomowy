import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getDevelopers,
  getManagers,
  addUserSkills
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.get("/developers", getDevelopers);
router.get("/managers", getManagers);

// Новый маршрут для добавления навыков
router.post("/:userId/skills", addUserSkills);

export default router;
