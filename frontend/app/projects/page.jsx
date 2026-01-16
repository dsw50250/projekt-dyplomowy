"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function Projects() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isManager = ["manager", "admin"].includes(user?.role);

  useEffect(() => {
    if (!token) router.push("/login");
    if (token) {
      loadProjects();
    }
    if (searchParams.get("create") === "true" && isManager) {
      setShowCreateModal(true);
    }
  }, [token, searchParams]);

  async function loadProjects() {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      toast.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    try {
      await api.post("/projects", { name, description });
      toast.success("Project created!");
      setShowCreateModal(false);
      setName("");
      setDescription("");
      loadProjects();
    } catch (err) {
      toast.error("Error creating project");
    }
  }

  function handleProjectClick(id) {
    router.push(`/tasks?project=${id}`);
  }

  const iconColor = (lightColor, darkColor) => (theme === "dark" ? darkColor : lightColor);

  return (
    <div className={`min-h-screen py-12 px-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800"}`}>
      <div className="max-w-6xl mx-auto p-8">
        <button
          onClick={() => router.back()}
          className={`mb-4 p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-800"}`}
        >
          Back
        </button>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-5xl font-bold">Projects</h1>
              {isManager && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-5 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-4"
                >
                  <i className={`fas fa-plus-circle text-2xl ${iconColor("text-white", "text-white")}`}></i>
                  Create Project
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProjectClick(p.id)}
                  className={`cursor-pointer p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border backdrop-blur-sm ${theme === "dark" ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-blue-100"}`}
                >
                  <i className={`fas fa-folder-open text-5xl mb-6 ${iconColor("text-blue-600", "text-blue-400")}`}></i>
                  <h3 className={`text-3xl font-bold mb-2 ${iconColor("text-gray-800", "text-white")}`}>{p.name}</h3>
                  <p className={`mt-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{p.description || "No description"}</p>
                  <div className={`mt-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    <p>Manager: {p.User?.name || "None"}</p>
                    <p>Tasks: {p.Task?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>

            {showCreateModal && isManager && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`max-w-md w-full p-10 rounded-2xl shadow-2xl backdrop-blur-sm ${theme === "dark" ? "bg-gray-800/90 text-white" : "bg-white/90 text-gray-800"}`}>
                  <h2 className="text-3xl font-bold mb-8">Create New Project</h2>
                  <form onSubmit={handleCreateProject} className="space-y-6">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-4 transition ${theme === "dark" ? "bg-gray-700 border-gray-600 focus:ring-blue-600 text-white" : "bg-white border-gray-300 focus:ring-blue-400 text-gray-800"}`}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="5"
                      className={`w-full px-6 py-4 border rounded-xl focus:outline-none focus:ring-4 transition ${theme === "dark" ? "bg-gray-700 border-gray-600 focus:ring-blue-600 text-white" : "bg-white border-gray-300 focus:ring-blue-400 text-gray-800"}`}
                    />
                    <div className="flex gap-6 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className={`px-8 py-4 rounded-xl font-semibold hover:shadow transition ${theme === "dark" ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-xl transition"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
