"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../services/api";

export default function Tasks() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [developers, setDevelopers] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Фильтры
  const [selectedProject, setSelectedProject] = useState("");
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false);

  const isManager = ["manager", "admin"].includes(user?.role);
  const isDeveloper = user?.role === "developer";
  const statuses = ["todo", "in-progress", "done"];

  useEffect(() => {
    if (!token) router.push("/login");
    if (token) {
      loadTasks();
      loadProjects();
      loadSkills();
      if (isManager) loadDevelopers();
    }

    const projectParam = searchParams.get("project");
    if (projectParam) setSelectedProject(projectParam);

    if (searchParams.get("create") === "true" && isManager) {
      setShowCreateModal(true);
    }
  }, [token, searchParams]);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSkills() {
    try {
      const res = await api.get("/skills");
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadDevelopers() {
    try {
      const res = await api.get("/users/developers");
      setDevelopers(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask(formData) {
    setLoading(true);
    try {
      await api.post("/tasks", {
        title: formData.title,
        description: formData.description,
        projectid: formData.projectid ? Number(formData.projectid) : null,
        assignedtoid: formData.assignedtoid ? Number(formData.assignedtoid) : null,
        status: formData.status,
        requiredSkillIds: formData.requiredSkillIds.map(Number),
      });
      setShowCreateModal(false);
      loadTasks();
    } catch (err) {
      alert("Error creating task: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(task) {
    setCurrentTask(task);
    setShowEditModal(true);
  }

  async function handleUpdateTask(formData) {
    setLoading(true);
    try {
      await api.put(`/tasks/${currentTask.id}`, {
        title: formData.title,
        description: formData.description,
        projectid: formData.projectid ? Number(formData.projectid) : null,
        assignedtoid: formData.assignedtoid ? Number(formData.assignedtoid) : null,
        status: formData.status,
        requiredSkillIds: formData.requiredSkillIds.map(Number),
      });
      setShowEditModal(false);
      loadTasks();
    } catch (err) {
      alert("Error updating task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (err) {
      alert("Error deleting task");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (isDeveloper && task.assignedtoid !== user.id) {
      alert("You can only change the status of your own tasks");
      return;
    }
    if (isManager) {
      alert("Managers can only view status");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      loadTasks();
    } catch (err) {
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  }

  // Фильтрация и сортировка
  const filteredTasks = tasks.filter((t) => {
    if (selectedProject && t.projectid !== Number(selectedProject)) return false;
    return true;
  });

  // Сортировка: свои задачи сверху
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.assignedtoid === user?.id && b.assignedtoid !== user?.id) return -1;
    if (b.assignedtoid === user?.id && a.assignedtoid !== user?.id) return 1;
    return 0;
  });

  const todoTasks = sortedTasks.filter((t) => t.status === "todo");
  const inProgressTasks = sortedTasks.filter((t) => t.status === "in-progress");
  const doneTasks = sortedTasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800">Tasks</h1>
        {isManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-teal-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Create Task
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-6 mb-10 items-center">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {isDeveloper && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyMyTasks}
              onChange={(e) => setShowOnlyMyTasks(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-700">Show only my tasks (dim others)</span>
          </label>
        )}
      </div>

      {loading && (
        <div className="text-center text-blue-600 font-semibold mb-6">
          Loading...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* To Do */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            To Do ({todoTasks.length})
          </h2>
          {todoTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              isMyTask={t.assignedtoid === user?.id}
              showOnlyMyTasks={showOnlyMyTasks}
            />
          ))}
        </div>

        {/* In Progress */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            In Progress ({inProgressTasks.length})
          </h2>
          {inProgressTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              isMyTask={t.assignedtoid === user?.id}
              showOnlyMyTasks={showOnlyMyTasks}
            />
          ))}
        </div>

        {/* Done */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Done ({doneTasks.length})
          </h2>
          {doneTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              isMyTask={t.assignedtoid === user?.id}
              showOnlyMyTasks={showOnlyMyTasks}
            />
          ))}
        </div>
      </div>

      {/* Модал создания */}
      {showCreateModal && isManager && (
        <CreateEditModal
          isEdit={false}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          projects={projects}
          developers={developers}
          skills={skills}
          statuses={statuses}
          loading={loading}
        />
      )}

      {/* Модал редактирования */}
      {showEditModal && isManager && (
        <CreateEditModal
          isEdit={true}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTask}
          onOpenEdit={openEditModal}
          projects={projects}
          developers={developers}
          skills={skills}
          statuses={statuses}
          loading={loading}
          initialData={currentTask}
        />
      )}
    </div>
  );

  function TaskCard({ task, isMyTask, showOnlyMyTasks }) {
    const canChangeStatus = isDeveloper && isMyTask;
    const cardClass = showOnlyMyTasks && !isMyTask
      ? "opacity-50 pointer-events-none"
      : "";

    return (
      <div className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition mb-6 ${cardClass}`}>
        <h3 className="text-2xl font-bold text-gray-800">{task.title}</h3>
        <p className="text-gray-600 mt-2">
          {task.description || "No description"}
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Assigned to: {task.User?.name || "Auto-assign"}
        </p>
        <p className="text-sm text-gray-500">
          Project: {task.Project?.name || "None"}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {task.TaskSkill?.map((ts) => (
            <span
              key={ts.skillid}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {ts.Skill.name}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 items-center">
          {canChangeStatus && (
            <select
              value={task.status}
              onChange={(e) => handleChangeStatus(task.id, e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace("-", " ").toUpperCase()}
                </option>
              ))}
            </select>
          )}

          {isManager && (
            <>
              <button
                onClick={() => openEditModal(task)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function CreateEditModal({ isEdit, onClose, onSubmit, projects, developers, skills, statuses, loading, initialData = {} }) {
    const [formTitle, setFormTitle] = useState(isEdit ? initialData.title || "" : "");
    const [formDescription, setFormDescription] = useState(isEdit ? initialData.description || "" : "");
    const [formProjectid, setFormProjectid] = useState(isEdit ? initialData.projectid?.toString() || "" : "");
    const [formAssignedtoid, setFormAssignedtoid] = useState(isEdit ? initialData.assignedtoid?.toString() || "" : "");
    const [formStatus, setFormStatus] = useState(isEdit ? initialData.status || "todo" : "todo");
    const [formRequiredSkillIds, setFormRequiredSkillIds] = useState(isEdit ? initialData.TaskSkill?.map((ts) => ts.skillid) || [] : []);

    const modalTitle = isEdit ? "Edit Task" : "Create New Task";

    function handleToggleSkill(skillId) {
      setFormRequiredSkillIds((prev) =>
        prev.includes(skillId)
          ? prev.filter((id) => id !== skillId)
          : [...prev, skillId]
      );
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      onSubmit({
        title: formTitle,
        description: formDescription,
        projectid: formProjectid,
        assignedtoid: formAssignedtoid,
        status: formStatus,
        requiredSkillIds: formRequiredSkillIds,
      });
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">{modalTitle}</h2>
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />

            <select
              value={formProjectid}
              onChange={(e) => setFormProjectid(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {isManager && (
              <select
                value={formAssignedtoid}
                onChange={(e) => setFormAssignedtoid(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Auto-assign</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace("-", " ").toUpperCase()}
                </option>
              ))}
            </select>

            <div className="mb-6">
              <p className="font-medium mb-3">Required Skills (for auto-assign):</p>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRequiredSkillIds.includes(s.id)}
                      onChange={() => handleToggleSkill(s.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}