import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Роутеры
import userRoutes from "./src/routes/userRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import skillRoutes from "./src/routes/skillRoutes.js"; // подключаем скиллы

// Middleware для аутентификации
import { authenticateToken } from "./src/middlewares/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Маршруты пользователей
app.use("/api/users", userRoutes);

// Маршруты проектов
app.use("/api/projects", projectRoutes);

// Маршруты задач
app.use("/api/tasks", taskRoutes);

// Маршруты навыков (skills)
app.use("/api/skills", skillRoutes); // все маршруты защищены внутри skillRoutes через authenticateToken

// Проверка работы сервера
app.get("/", (req, res) => res.send("API is running"));

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
