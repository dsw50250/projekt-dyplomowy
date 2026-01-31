import prisma from "../prismaClient.js";

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

export const getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

export const addMySkills = async (req, res) => {
  const { skillIds } = req.body;
  if (!skillIds || !Array.isArray(skillIds)) {
    return res.status(400).json({ error: "skillIds must be an array" });
  }

  const uniqueSkillIds = [...new Set(skillIds.map(id => Number(id)))]; // убираем дубли в массиве, если они есть

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userSkill.deleteMany({
        where: { userid: req.user.id },
      });

      if (uniqueSkillIds.length > 0) {
        await tx.userSkill.createMany({
          data: uniqueSkillIds.map(skillid => ({
            userid: req.user.id,
            skillid: skillid,
          })),
          skipDuplicates: true, 
        });
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { UserSkill: { include: { Skill: true } } },
    });

    res.json(user.UserSkill || []);
  } catch (err) {
    console.error("addMySkills error:", err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: "Конфликт: некоторые навыки уже существуют (дубликат)" });
    }
    res.status(500).json({ error: err.message || "Ошибка сервера" });
  }
};

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
