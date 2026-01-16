import prisma from "../prismaClient.js";

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

export const createProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        managerid: req.user.id, 
      },
    });

    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

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
