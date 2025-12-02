import prisma from "../prismaClient.js";

// Получить проекты:
// - менеджер видит все проекты
// - разработчик видит только проекты, где есть назначенные ему задачи
export const getAllProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "manager") {
      projects = await prisma.project.findMany({
        include: {
          User: true,
          Task: true,
        },
      });
    } else {
      // разработчик видит только свои проекты
      projects = await prisma.project.findMany({
        where: {
          Task: {
            some: { assignedtoid: req.user.id },
          },
        },
        include: {
          User: true,
          Task: true,
        },
      });
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Создать проект (только менеджер)
export const createProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        managerid: req.user.id, // автоматом назначаем создателя менеджером проекта
      },
    });

    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Обновить проект (только менеджер)
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });

    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Удалить проект (только менеджер)
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
