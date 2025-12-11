import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import { generateToken } from "../middlewares/auth.js";

// Регистрация пользователя
export const registerUser = async (req, res) => {
  const { name, email, password, role, skillIds } = req.body;
  const validRoles = ["developer", "manager", "admin"];
  if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        UserSkill: skillIds
          ? { create: skillIds.map(id => ({ skillid: id })) }
          : undefined
      },
      include: { UserSkill: { include: { Skill: true } } }
    });

    // === НОВАЯ ЧАСТЬ: автологин после регистрации ===
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000 // 8 часов
    });

res.json({ token });
    // ===========================================
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Логин пользователя
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user);

    // === НОВАЯ ЧАСТЬ: ставим куку ===
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000 // 8 часов
    });

res.json({ token });
    // =================================
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Получить всех пользователей (только manager/admin)
export const getAllUsers = async (req, res) => {
  if (!["admin", "manager"].includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  try {
    const users = await prisma.user.findMany({ include: { UserSkill: { include: { Skill: true } } } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDevelopers = async (req, res) => {
  if (!["admin", "manager"].includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  try {
    const developers = await prisma.user.findMany({
      where: { role: "developer" },
      include: { UserSkill: { include: { Skill: true } } }
    });
    res.json(developers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getManagers = async (req, res) => {
  if (!["admin", "manager"].includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  try {
    const managers = await prisma.user.findMany({
      where: { role: "manager" },
      include: { UserSkill: { include: { Skill: true } } }
    });
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};