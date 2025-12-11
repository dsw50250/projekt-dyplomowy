"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Skills() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
    if (token) loadSkills();
  }, [token, loading]);

  async function loadSkills() {
    const res = await api.get("/skills");
    setSkills(res.data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Skills</h1>
      {skills.map(s => (
        <div key={s.id}>{s.name}</div>
      ))}
    </div>
  );
}
