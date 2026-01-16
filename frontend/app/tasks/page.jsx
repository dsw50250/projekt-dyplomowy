"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function Tasks() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
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
      toast.error("Error loading tasks");
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      toast.error("Error loading projects");
    }
  }

  async function loadSkills() {
    try {
      const res = await api.get("/skills");
      setSkills(res.data);
    } catch (err) {
      toast.error("Error loading skills");
    }
  }

  async function loadDevelopers() {
    try {
      const res = await api.get("/users/developers");
      setDevelopers(res.data);
    } catch (err) {
      toast.error("Error loading developers");
    }
  }

  async function handleCreateTask(formData) {
    setLoading(true);
    try {
      await api.post("/tasks", formData);
      if (formData.assignedtoid) {
        toast.success("Task created and assigned to user!");
      } else {
        toast.success("Task created!");
      }
      setShowCreateModal(false);
      loadTasks();
    } catch (err) {
      toast.error("Error creating task: " + (err.response?.data?.error || err.message));
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
      await api.put(`/tasks/${currentTask.id}`, formData);
      if (formData.assignedtoid && formData.assignedtoid !== currentTask.assignedtoid) {
        toast.success("Task updated and reassigned to user!");
      } else {
        toast.success("Task updated!");
      }
      setShowEditModal(false);
      loadTasks();
    } catch (err) {
      toast.error("Error updating task");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted!");
      loadTasks();
    } catch (err) {
      toast.error("Error deleting task");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (isDeveloper && task.assignedtoid !== user.id) {
      toast.error("You can only change the status of your own tasks");
      return;
    }
    if (isManager) {
      toast.error("Managers can only view status");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Status updated!");
      loadTasks();
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSortedTasks = [...tasks]
    .filter((t) => {
      if (selectedProject && t.projectid !== Number(selectedProject)) return false;
      return true; 
    })
    .sort((a, b) => {
      if (a.assignedtoid === user?.id && b.assignedtoid !== user?.id) return -1;
      if (b.assignedtoid === user?.id && a.assignedtoid !== user?.id) return 1;
      return 0;
    });

  const todoTasks = filteredAndSortedTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredAndSortedTasks.filter((t) => t.status === "in-progress");
  const doneTasks = filteredAndSortedTasks.filter((t) => t.status === "done");

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
      <button
        onClick={() => router.back()}
        className="mb-8 inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition shadow-md"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      {isManager && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-600 to-teal-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2 mb-6"
        >
          Create Task
        </button>
      )}

      {isDeveloper && (
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyMyTasks}
              onChange={(e) => setShowOnlyMyTasks(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>Show only my tasks</span>
          </label>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-xl">
          Loading...
        </div>
      )}

      {}
      <div className="flex gap-6 mb-8">
        {}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">To Do ({todoTasks.length})</h2>
          <div className="flex flex-col gap-4">
            {todoTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                isMyTask={t.assignedtoid === user?.id}
                showOnlyMyTasks={showOnlyMyTasks}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onChangeStatus={handleChangeStatus}
                isManager={isManager}
                isDeveloper={isDeveloper}
                statuses={statuses}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">In Progress ({inProgressTasks.length})</h2>
          <div className="flex flex-col gap-4">
            {inProgressTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                isMyTask={t.assignedtoid === user?.id}
                showOnlyMyTasks={showOnlyMyTasks}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onChangeStatus={handleChangeStatus}
                isManager={isManager}
                isDeveloper={isDeveloper}
                statuses={statuses}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4">Done ({doneTasks.length})</h2>
          <div className="flex flex-col gap-4">
            {doneTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                isMyTask={t.assignedtoid === user?.id}
                showOnlyMyTasks={showOnlyMyTasks}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onChangeStatus={handleChangeStatus}
                isManager={isManager}
                isDeveloper={isDeveloper}
                statuses={statuses}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>

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
          theme={theme}
        />
      )}

      {showEditModal && isManager && (
        <CreateEditModal
          isEdit={true}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTask}
          projects={projects}
          developers={developers}
          skills={skills}
          statuses={statuses}
          loading={loading}
          initialData={currentTask}
          theme={theme}
        />
      )}
    </div>
  );
}

function TaskCard({ task, isMyTask, showOnlyMyTasks, onEdit, onDelete, onChangeStatus, isManager, isDeveloper, statuses, theme }) {
  const canChangeStatus = isDeveloper && isMyTask;

  return (
    <div
      className={`p-6 rounded-xl shadow-lg border ${
        theme === "dark" ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"
      } ${showOnlyMyTasks && !isMyTask ? "opacity-50 pointer-events-none" : ""}`}
    >
      <h3 className="text-xl font-semibold mb-3">{task.title}</h3>
      <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
        {task.description || "No description"}
      </p>
      <div className="space-y-1 mb-4 text-sm">
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
          Assigned to: {task.User?.name || "Auto-assign"}
        </p>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
          Project: {task.Project?.name || "None"}
        </p>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
          Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {task.TaskSkill?.map((ts) => (
          <span
            key={ts.skillid}
            className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium dark:text-gray-200"
          >
            {ts.Skill.name}
          </span>
        ))}
      </div>

      {canChangeStatus && (
        <select
          value={task.status}
          onChange={(e) => onChangeStatus(task.id, e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg mb-4 text-sm ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-800"}`}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("-", " ").toUpperCase()}
            </option>
          ))}
        </select>
      )}

      {isManager && (
        <div className="flex gap-6 mt-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CreateEditModal({ isEdit, onClose, onSubmit, projects, developers, skills, statuses, loading, initialData = {}, theme }) {
  const [formTitle, setFormTitle] = useState(isEdit ? initialData.title || "" : "");
  const [formDescription, setFormDescription] = useState(isEdit ? initialData.description || "" : "");
  const [formProjectid, setFormProjectid] = useState(isEdit ? initialData.projectid?.toString() || "" : "");
  const [formAssignedtoid, setFormAssignedtoid] = useState(isEdit ? initialData.assignedtoid?.toString() || "" : "");
  const [formStatus, setFormStatus] = useState(isEdit ? initialData.status || "todo" : "todo");
  const [formRequiredSkillIds, setFormRequiredSkillIds] = useState(
    isEdit ? initialData.TaskSkill?.map((ts) => ts.skillid) || [] : []
  );
  const [formDueDate, setFormDueDate] = useState(
    isEdit && initialData.dueDate ? new Date(initialData.dueDate).toISOString().split("T")[0] : ""
  );

  const modalTitle = isEdit ? "Edit Task" : "Create New Task";

  function handleToggleSkill(skillId) {
    setFormRequiredSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    onSubmit({
      title: formTitle,
      description: formDescription,
      projectid: formProjectid ? Number(formProjectid) : null,
      assignedtoid: formAssignedtoid ? Number(formAssignedtoid) : null,
      status: formStatus,
      requiredSkillIds: formRequiredSkillIds,
      dueDate: formDueDate || undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className={`w-full max-w-lg rounded-2xl p-8 shadow-2xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <h2 className="text-3xl font-bold mb-8">{modalTitle}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Task title"
            required
            className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"}`}
          />
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Description (optional)"
            rows="4"
            className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"}`}
          />
          <select
            value={formProjectid}
            onChange={(e) => setFormProjectid(e.target.value)}
            className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"}`}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={formAssignedtoid}
            onChange={(e) => setFormAssignedtoid(e.target.value)}
            className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"}`}
          >
            <option value="">Auto-assign</option>
                        {developers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value)}
            className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
            }`}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={formDueDate}
            onChange={(e) => setFormDueDate(e.target.value)}
            className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
            }`}
          />

          <div>
            <p className="font-medium mb-3">Required Skills:</p>
            <div className="grid grid-cols-2 gap-3">
              {skills.map((skill) => (
                <label key={skill.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRequiredSkillIds.includes(skill.id)}
                    onChange={() => handleToggleSkill(skill.id)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold ${
                theme === "dark" ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold text-white ${
                theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

