"use client";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token]);

  if (!token) return null;

  const isManagerOrAdmin = ["manager", "admin"].includes(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Dashboard</h1>
        <p className="text-xl text-gray-600 mb-12">
          Welcome back, <span className="font-semibold text-indigo-700">{user?.name || user?.role.toUpperCase()}</span>!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Link href="/projects" className="block">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
              <i className="fas fa-project-diagram text-5xl text-blue-600 mb-6"></i>
              <h2 className="text-3xl font-bold text-gray-800">Projects</h2>
              <p className="mt-4 text-gray-600">View and manage projects</p>
            </div>
          </Link>

          <Link href="/tasks" className="block">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
              <i className="fas fa-tasks text-5xl text-green-600 mb-6"></i>
              <h2 className="text-3xl font-bold text-gray-800">Tasks</h2>
              <p className="mt-4 text-gray-600">Kanban board with your tasks</p>
            </div>
          </Link>

          <Link href="/developers" className="block">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
              <i className="fas fa-users text-5xl text-purple-600 mb-6"></i>
              <h2 className="text-3xl font-bold text-gray-800">Team</h2>
              <p className="mt-4 text-gray-600">Developers and their skills</p>
            </div>
          </Link>

          <Link href="/skills" className="block">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100">
              <i className="fas fa-cogs text-5xl text-orange-600 mb-6"></i>
              <h2 className="text-3xl font-bold text-gray-800">Skills</h2>
              <p className="mt-4 text-gray-600">Manage your skills</p>
            </div>
          </Link>
        </div>

        {isManagerOrAdmin && (
          <div className="flex flex-wrap gap-6">
            <button
              onClick={() => router.push("/projects?create=true")}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-5 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-4"
            >
              <i className="fas fa-plus-circle text-2xl"></i>
              Create New Project
            </button>

            <button
              onClick={() => router.push("/tasks?create=true")}
              className="bg-gradient-to-r from-green-600 to-teal-700 text-white px-8 py-5 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-4"
            >
              <i className="fas fa-plus-circle text-2xl"></i>
              Create New Task
            </button>
          </div>
        )}

        <div className="mt-12">
          <button
            onClick={() => router.push("/skills?add=true")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-5 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-4"
          >
            <i className="fas fa-plus-circle text-2xl"></i>
            Add / Update My Skills
          </button>
        </div>
      </div>
    </div>
  );
}