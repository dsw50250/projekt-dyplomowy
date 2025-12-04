import prisma from "../prismaClient.js";

// Получение задач
export const getAllTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "manager") {
      tasks = await prisma.task.findMany({
        include: { User: true, Project: true, TaskSkill: { include: { Skill: true } } }
      });
    } else if (req.user.role === "developer") {
      tasks = await prisma.task.findMany({
        where: { assignedtoid: req.user.id },
        include: { User: true, Project: true, TaskSkill: { include: { Skill: true } } }
      });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const tasksWithMeta = tasks.map(task => ({
      ...task,
      autoAssigned: task.assignedtoid && !task.manuallyAssigned, // если не вручную
      managerName: req.user.name
    }));

    res.json(tasksWithMeta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создание задачи с авто-распределением
export const createTask = async (req, res) => {
  const { title, description, difficulty, status, projectid, assignedtoid, requiredSkillIds } = req.body;

  try {
    let finalAssignedId = assignedtoid;
    let manuallyAssigned = !!assignedtoid;

    if (!assignedtoid && requiredSkillIds?.length > 0) {
      const candidates = await prisma.user.findMany({
        where: { role: "developer", UserSkill: { some: { skillid: { in: requiredSkillIds } } } },
        include: { Task: true }
      });

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.Task.length - b.Task.length);
        finalAssignedId = candidates[0].id;
      }
    }

    const task = await prisma.task.create({
      data: { title, description, difficulty, status, projectid, assignedtoid: finalAssignedId }
    });

    if (requiredSkillIds?.length > 0) {
      await prisma.taskSkill.createMany({
        data: requiredSkillIds.map(skillid => ({ taskid: task.id, skillid }))
      });
    }

    const taskWithSkills = await prisma.task.findUnique({
      where: { id: task.id },
      include: { TaskSkill: { include: { Skill: true } }, User: true }
    });

    res.json({
      ...taskWithSkills,
      autoAssigned: !manuallyAssigned && finalAssignedId,
      managerName: req.user.name
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Обновление задачи
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, difficulty, status, projectid, assignedtoid, requiredSkillIds } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { title, description, difficulty, status, projectid, assignedtoid }
    });

    if (requiredSkillIds) {
      await prisma.taskSkill.deleteMany({ where: { taskid: task.id } });
      await prisma.taskSkill.createMany({
        data: requiredSkillIds.map(skillid => ({ taskid: task.id, skillid }))
      });
    }

    const taskWithSkills = await prisma.task.findUnique({
      where: { id: task.id },
      include: { TaskSkill: { include: { Skill: true } }, User: true }
    });

    res.json({
      ...taskWithSkills,
      autoAssigned: false,
      managerName: req.user.name
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Удаление задачи
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
