"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Developers() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [developers, setDevelopers] = useState([]);
  const [skillsMap, setSkillsMap] = useState({});

  useEffect(() => {
    if (!loading && !token) router.push("/login");
    if (token) loadDevelopers();
  }, [token, loading]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-12">Team</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {developers.map((d) => (
            <div key={d.id} className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
              <i className="fas fa-user-astronaut text-6xl text-purple-600 mb-6"></i>
              <h2 className="text-3xl font-bold text-gray-800">{d.name}</h2>
              <p className="mt-4 text-gray-600">{d.email}</p>
              <div className="mt-8">
                <p className="font-semibold text-gray-700 mb-4">Skills:</p>
                <div className="flex flex-wrap gap-3">
                  {skillsMap[d.id]?.length > 0 ? (
                    skillsMap[d.id].map((s) => (
                      <span key={s} className="bg-purple-100 text-purple-800 px-5 py-2 rounded-full text-sm font-medium">
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills yet</p>
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