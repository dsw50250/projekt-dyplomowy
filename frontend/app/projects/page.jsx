"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../services/api";

export default function Projects() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isManager = ["manager", "admin"].includes(user?.role);

  useEffect(() => {
    if (!token) router.push("/login");
    if (token) loadProjects();
    if (searchParams.get("create") === "true" && isManager) setShowCreateModal(true);
  }, [token, searchParams]);

  async function loadProjects() {
    const res = await api.get("/projects");
    setProjects(res.data);
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    try {
      await api.post("/projects", { name, description });
      setShowCreateModal(false);
      setName("");
      setDescription("");
      loadProjects();
    } catch (err) {
      alert("Error creating project");
    }
  }

  function handleProjectClick(id) {
    router.push(`/tasks?project=${id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800">Projects</h1>
          {isManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-5 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-4"
            >
              <i className="fas fa-plus-circle text-2xl"></i>
              Create Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => handleProjectClick(p.id)}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 cursor-pointer"
            >
              <i className="fas fa-folder-open text-5xl text-blue-600 mb-6"></i>
              <h3 className="text-3xl font-bold text-gray-800">{p.name}</h3>
              <p className="text-gray-600 mt-4">{p.description || "No description"}</p>
              <div className="mt-6 text-sm text-gray-500">
                <p>Manager: {p.User?.name || "None"}</p>
                <p>Tasks: {p.Task?.length || 0}</p>
              </div>
            </div>
          ))}
        </div>

        {showCreateModal && isManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 max-w-md w-full shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                />
                <div className="flex gap-6 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-xl transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}