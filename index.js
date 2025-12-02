import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import skillRoutes from "./src/routes/skillRoutes.js";
import { authenticateToken } from "./src/middlewares/auth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Пользователи — регистрация и логин открыты, остальное защищено
app.use("/api/users", userRoutes);

// Задачи — все маршруты защищены
app.use("/api/tasks", authenticateToken, taskRoutes);

// Проекты — можно добавить authMiddleware если нужно
app.use("/api/projects", authenticateToken, projectRoutes);

// Навыки — все маршруты защищены
app.use("/api/skills", skillRoutes);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
