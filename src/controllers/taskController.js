import prisma from "../prismaClient.js";

export const getAllTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "manager" || req.user.role === "admin") {
      // Менеджер видит ВСЕ задачи
      tasks = await prisma.task.findMany({
        include: { User: true, Project: true, TaskSkill: { include: { Skill: true } } }
      });
    } else if (req.user.role === "developer") {
      // Developer видит ВСЕ задачи (не только свои)
      tasks = await prisma.task.findMany({
        include: { User: true, Project: true, TaskSkill: { include: { Skill: true } } }
      });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const tasksWithMeta = tasks.map(task => ({
      ...task,
      autoAssigned: !!task.assignedtoid,
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
      data: { title, description, difficulty, status, projectid, assignedtoid: finalAssignedId, manuallyAssigned: manuallyAssigned }
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
    // Проверка прав: developer может менять статус ТОЛЬКО своей задачи
    if (req.user.role === "developer") {
      if (req.body.status) { // если пытается изменить статус
        const task = await prisma.task.findUnique({
          where: { id: parseInt(id) }
        });

        if (!task || task.assignedtoid !== req.user.id) {
          return res.status(403).json({ error: "You can only update status of your own tasks" });
        }
      }

      // Опционально: запретить developer'у менять другие поля (assignedtoid, projectid и т.д.)
      // Если хочешь — раскомментируй:
      // if (assignedtoid || projectid) {
      //   return res.status(403).json({ error: "Developers cannot reassign tasks or change project" });
      // }
    }

    // Основное обновление задачи (доступно manager'у полностью, developer'у — только статус)
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        difficulty,
        status,
        projectid: projectid ? parseInt(projectid) : undefined,
        assignedtoid: assignedtoid ? parseInt(assignedtoid) : undefined,
      }
    });

    // Обновление требуемых скиллов (если переданы)
    if (requiredSkillIds && Array.isArray(requiredSkillIds)) {
      await prisma.taskSkill.deleteMany({ where: { taskid: updatedTask.id } });
      await prisma.taskSkill.createMany({
        data: requiredSkillIds.map(skillid => ({
          taskid: updatedTask.id,
          skillid: parseInt(skillid)
        }))
      });
    }

    // Возвращаем обновлённую задачу с скиллами
    const taskWithSkills = await prisma.task.findUnique({
      where: { id: updatedTask.id },
      include: {
        TaskSkill: { include: { Skill: true } },
        User: true,
        Project: true
      }
    });

    res.json({
      ...taskWithSkills,
      autoAssigned: !!updatedTask.assignedtoid && !updatedTask.manuallyAssigned,
      managerName: req.user.name
    });

  } catch (err) {
    console.error("Update task error:", err);
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
