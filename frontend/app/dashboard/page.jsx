"use client";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  if (!token) return null;

  const userRole = (user?.role || "").toLowerCase().trim();
  const isManagerOrAdmin = userRole === "manager" || userRole === "admin";

  const iconColor = (lightColor, darkColor) =>
    theme === "dark" ? darkColor : lightColor;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800"
      }`}
    >
      <div className="max-w-6xl mx-auto p-8">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
  <div>
    <h1 className="text-5xl font-bold mb-2">Dashboard</h1>
    <p className="text-xl">
      Welcome back,{" "}
      <span
        className={`font-semibold ${
          theme === "dark" ? "text-indigo-400" : "text-indigo-600"
        }`}
      >
        {user?.role ? user.role.toUpperCase() : "USER"}
      </span>
      !
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-4">
    <Link
      href="/calendar"
      className={`p-2 rounded-xl transition ${
        theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      <i
        className={`fas fa-calendar-alt text-2xl ${iconColor("text-gray-800", "text-white")}`}
      ></i>
    </Link>
    <button
      onClick={toggleTheme}
      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition shadow-md"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
    <button
      onClick={logout}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-md"
    >
      Logout
    </button>
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Link href="/projects" className="block">
            <div
              className={`p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${
                theme === "dark"
                  ? "bg-gray-800/80 border-gray-700"
                  : "bg-white/80 border-blue-100"
              } backdrop-blur-sm`}
            >
              <i
                className={`fas fa-project-diagram text-5xl mb-6 ${iconColor(
                  "text-blue-600",
                  "text-blue-400"
                )}`}
              ></i>
              <h2
                className={`text-3xl font-bold mb-2 ${iconColor(
                  "text-gray-800",
                  "text-white"
                )}`}
              >
                Projects
              </h2>
              <p className={`text-gray-600 ${theme === "dark" ? "text-gray-300" : ""}`}>
                View and manage projects
              </p>
            </div>
          </Link>

          <Link href="/tasks" className="block">
            <div
              className={`p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${
                theme === "dark"
                  ? "bg-gray-800/80 border-gray-700"
                  : "bg-white/80 border-green-100"
              } backdrop-blur-sm`}
            >
              <i
                className={`fas fa-tasks text-5xl mb-6 ${iconColor(
                  "text-green-600",
                  "text-green-400"
                )}`}
              ></i>
              <h2
                className={`text-3xl font-bold mb-2 ${iconColor(
                  "text-gray-800",
                  "text-white"
                )}`}
              >
                Tasks
              </h2>
              <p className={`text-gray-600 ${theme === "dark" ? "text-gray-300" : ""}`}>
                Kanban board with your tasks
              </p>
            </div>
          </Link>

          <Link href="/developers" className="block">
            <div
              className={`p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${
                theme === "dark"
                  ? "bg-gray-800/80 border-gray-700"
                  : "bg-white/80 border-purple-100"
              } backdrop-blur-sm`}
            >
              <i
                className={`fas fa-users text-5xl mb-6 ${iconColor(
                  "text-purple-600",
                  "text-purple-400"
                )}`}
              ></i>
              <h2
                className={`text-3xl font-bold mb-2 ${iconColor(
                  "text-gray-800",
                  "text-white"
                )}`}
              >
                Team
              </h2>
              <p className={`text-gray-600 ${theme === "dark" ? "text-gray-300" : ""}`}>
                Developers and their skills
              </p>
            </div>
          </Link>

          <Link href="/skills" className="block">
            <div
              className={`p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${
                theme === "dark"
                  ? "bg-gray-800/80 border-gray-700"
                  : "bg-white/80 border-orange-100"
              } backdrop-blur-sm`}
            >
              <i
                className={`fas fa-cogs text-5xl mb-6 ${iconColor(
                  "text-orange-600",
                  "text-orange-400"
                )}`}
              ></i>
              <h2
                className={`text-3xl font-bold mb-2 ${iconColor(
                  "text-gray-800",
                  "text-white"
                )}`}
              >
                Skills
              </h2>
              <p className={`text-gray-600 ${theme === "dark" ? "text-gray-300" : ""}`}>
                Manage your skills
              </p>
            </div>
          </Link>
        </div>

        {isManagerOrAdmin && (
          <div className="flex flex-wrap gap-6 mb-10">
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