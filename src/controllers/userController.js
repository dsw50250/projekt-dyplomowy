import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import { generateToken } from "../middlewares/auth.js";

// Регистрация пользователя
export const registerUser = async (req, res) => {
  const { name, email, password, role, skillIds } = req.body; // skillIds — массив id навыков
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
      include: { UserSkill: true }
    });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, skills: user.UserSkill });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Логин пользователя
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Получить всех пользователей
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { UserSkill: { include: { Skill: true } } } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получить только разработчиков
export const getDevelopers = async (req, res) => {
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

// Получить только менеджеров
export const getManagers = async (req, res) => {
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

// Добавить навыки пользователю
export const addUserSkills = async (req, res) => {
  const { userId } = req.params;
  const { skillIds } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        UserSkill: {
          create: skillIds.map(id => ({ skillid: id }))
        }
      },
      include: { UserSkill: { include: { Skill: true } } }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
