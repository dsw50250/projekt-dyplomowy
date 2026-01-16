"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

export default function Developers() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [developers, setDevelopers] = useState([]);
  const [skillsMap, setSkillsMap] = useState({});

  useEffect(() => {
    if (!authLoading && !token) router.push("/login");
    if (token) loadDevelopers();
  }, [token, authLoading]);

  async function loadDevelopers() {
    const res = await api.get("/users/developers");
    const devs = res.data;
    setDevelopers(devs);

    const skillsPromises = devs.map((d) => api.get(`/skills/user/${d.id}`));
    const skillsResults = await Promise.all(skillsPromises);
    const map = {};
    devs.forEach((d, i) => {
      map[d.id] = skillsResults[i].data.map((us) => us.Skill.name);
    });
    setSkillsMap(map);
  }

  const iconColor = (lightColor, darkColor) => (theme === "dark" ? darkColor : lightColor);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800"}`}>
      <div className="max-w-6xl mx-auto p-8">
        {}
        <button
          onClick={() => router.back()}
          className={`mb-8 inline-flex items-center px-6 py-3 rounded-xl font-medium transition shadow-md ${theme === "dark" ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-300 text-gray-800 hover:bg-gray-400"}`}
        >
          ← Back
        </button>

        <h1 className="text-5xl font-bold mb-12">Team</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {developers.map((d) => (
            <div
              key={d.id}
              className={`p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border backdrop-blur-sm ${theme === "dark" ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-purple-100"}`}
            >
              <i className={`fas fa-user-astronaut text-6xl mb-6 ${iconColor("text-purple-600", "text-purple-400")}`}></i>
              <h2 className={`text-3xl font-bold mb-2 ${iconColor("text-gray-800", "text-white")}`}>{d.name}</h2>
              <p className={`mt-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{d.email}</p>
              <div className="mt-8">
                <p className={`font-semibold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>Skills:</p>
                <div className="flex flex-wrap gap-3">
                  {skillsMap[d.id]?.length > 0 ? (
                    skillsMap[d.id].map((s) => (
                      <span
                        key={s}
                        className={`px-5 py-2 rounded-full text-sm font-medium ${theme === "dark" ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-800"}`}
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>No skills yet</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
