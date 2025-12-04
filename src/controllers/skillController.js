import prisma from "../prismaClient.js";

// Создание глобального навыка (только manager/admin)
export const createSkill = async (req, res) => {
  if (!["admin", "manager"].includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Skill name is required" });

  try {
    const skill = await prisma.skill.create({ data: { name } });
    res.json(skill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Все навыки (для выбора)
export const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Навыки текущего пользователя
export const getMySkills = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { UserSkill: { include: { Skill: true } } }
    });
    res.json(user.UserSkill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Добавление навыков текущему пользователю
export const addMySkills = async (req, res) => {
  const { skillIds } = req.body;
  if (!skillIds || !Array.isArray(skillIds)) return res.status(400).json({ error: "skillIds must be an array" });

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { UserSkill: { create: skillIds.map(id => ({ skillid: id })) } },
      include: { UserSkill: { include: { Skill: true } } }
    });
    res.json(updated.UserSkill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Удаление навыка у текущего пользователя
export const removeMySkill = async (req, res) => {
  const { skillId } = req.params;
  try {
    await prisma.userSkill.delete({
      where: { userid_skillid: { userid: req.user.id, skillid: Number(skillId) } }
    });
    res.json({ message: "Skill removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Получение навыков другого пользователя (manager/admin)
export const getUserSkills = async (req, res) => {
  if (!["admin", "manager"].includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });

  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { UserSkill: { include: { Skill: true } } }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.UserSkill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
