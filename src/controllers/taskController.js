import prisma from "../prismaClient.js";

// Получение задач — менеджер видит все, разработчик только свои
export const getAllTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "manager") {
      tasks = await prisma.task.findMany({
        include: { 
          User: true, 
          Project: true, 
          TaskSkill: { include: { Skill: true } } 
        }
      });
    } else if (req.user.role === "developer") {
      tasks = await prisma.task.findMany({
        where: { assignedtoid: req.user.id },
        include: { 
          User: true, 
          Project: true, 
          TaskSkill: { include: { Skill: true } } 
        }
      });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создание задачи с автоназначением по навыкам — только менеджер
export const createTask = async (req, res) => {
  const { title, description, difficulty, status, projectid, assignedtoid, requiredSkillIds } = req.body;
  try {
    let finalAssignedId = assignedtoid;

    // Автоназначение, если менеджер не указал конкретного разработчика
    if (!assignedtoid && requiredSkillIds && requiredSkillIds.length > 0) {
      const candidates = await prisma.user.findMany({
        where: {
          role: "developer",
          UserSkill: { some: { skillid: { in: requiredSkillIds } } }
        },
        include: { Task: true }
      });

      if (candidates.length > 0) {
        // выбираем разработчика с минимальной нагрузкой
        candidates.sort((a, b) => a.Task.length - b.Task.length);
        finalAssignedId = candidates[0].id;
      }
    }

    // Создаём задачу
    const task = await prisma.task.create({
      data: { title, description, difficulty, status, projectid, assignedtoid: finalAssignedId }
    });

    // Связываем задачу с требуемыми навыками
    if (requiredSkillIds && requiredSkillIds.length > 0) {
      await prisma.taskSkill.createMany({
        data: requiredSkillIds.map(skillid => ({ taskid: task.id, skillid }))
      });
    }

    // Возвращаем задачу с навыками и назначенным пользователем
    const taskWithSkills = await prisma.task.findUnique({
      where: { id: task.id },
      include: { TaskSkill: { include: { Skill: true } }, User: true }
    });

    res.json(taskWithSkills);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Обновление задачи — только менеджер
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, difficulty, status, projectid, assignedtoid, requiredSkillIds } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { title, description, difficulty, status, projectid, assignedtoid }
    });

    // Обновляем навыки задачи
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

    res.json(taskWithSkills);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Удаление задачи — только менеджер
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
