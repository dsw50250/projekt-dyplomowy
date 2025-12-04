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

// ТЕСТОВЫЙ РОУТ — ОТКРОЙ http://localhost:3000/test-login
app.post("/test-login", (req, res) => {
  console.log("req.body →", req.body); // ← это увидим в терминале
  res.json({ received: req.body, ok: true });
});

app.use(express.json());
app.use(cookieParser());

// НОВАЯ СТРОКА — раздаём фронтенд
app.use(express.static("public"));

// Пользователи — регистрация и логин открыты
app.use("/api/users", userRoutes);

// Задачи
app.use("/api/tasks", authenticateToken, taskRoutes);

// Проекты
app.use("/api/projects", authenticateToken, projectRoutes);

// Навыки
app.use("/api/skills", skillRoutes);

// НОВАЯ СТРОКА — главная страница
app.get("/", (req, res) => {
  res.sendFile("login.html", { root: "public" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));