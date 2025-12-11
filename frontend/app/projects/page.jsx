"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Projects() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
    if (token) loadProjects();
  }, [token, loading]);

  async function loadProjects() {
    const res = await api.get("/projects");
    setProjects(res.data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Projects</h1>
      {projects.map(p => (
        <div key={p.id}>
          <b>{p.name}</b> — {p.description || "No description"}
        </div>
      ))}
    </div>
  );
}
