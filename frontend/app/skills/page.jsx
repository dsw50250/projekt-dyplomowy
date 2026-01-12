"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../services/api";

export default function Skills() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const isManager = ["manager", "admin"].includes(user?.role);

  useEffect(() => {
    if (!token) router.push("/login");
    if (token) {
      loadAllSkills();
      loadMySkills();
    }
    if (searchParams.get("add") === "true") setShowAddModal(true);
  }, [token, searchParams]);

  async function loadAllSkills() {
    const res = await api.get("/skills");
    setAllSkills(res.data);
  }

  async function loadMySkills() {
    const res = await api.get("/skills/me");
    const skillIds = res.data.map((us) => us.Skill.id);
    setMySkills(res.data.map((us) => us.Skill));
    setSelectedSkills(skillIds);
  }

  async function handleAddMySkills() {
    try {
      await api.post("/skills/me", { skillIds: selectedSkills });
      setShowAddModal(false);
      loadMySkills();
    } catch (err) {
      alert("Error updating skills");
    }
  }

  async function handleCreateSkill(e) {
    e.preventDefault();
    try {
      await api.post("/skills", { name: newSkillName });
      setNewSkillName("");
      setShowCreateModal(false);
      loadAllSkills();
    } catch (err) {
      alert("Error creating skill");
    }
  }

  function toggleSkill(skillId) {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Skills Management</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Мои навыки */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">My Skills</h2>
          <div className="flex flex-wrap gap-3">
            {mySkills.length === 0 ? (
              <p className="text-gray-500">No skills added yet</p>
            ) : (
              mySkills.map((s) => (
                <span key={s.id} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
                  {s.name}
                </span>
              ))
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 bg-gradient-to-r from-purple-600 to-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add / Update My Skills
          </button>
        </div>

        {/* Все доступные навыки */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">All Available Skills</h2>
            {isManager && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:shadow-lg transition text-sm"
              >
                <i className="fas fa-plus"></i> Create New Skill
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {allSkills.map((s) => (
              <span key={s.id} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Модал добавления своих навыков */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Select Your Skills</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {allSkills.map((s) => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(s.id)}
                    onChange={() => toggleSkill(s.id)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="font-medium">{s.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddMySkills}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Save My Skills
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модал создания нового навыка (только manager/admin) */}
      {showCreateModal && isManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Skill</h2>
            <form onSubmit={handleCreateSkill}>
              <input
                type="text"
                placeholder="Skill name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setNewSkillName(""); }}
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}