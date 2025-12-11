"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Tasks() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
    if (token) loadTasks();
  }, [token, loading]);

  async function loadTasks() {
    const res = await api.get("/tasks");
    setTasks(res.data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Tasks</h1>
      {tasks.map(t => (
        <div key={t.id}>
          <b>{t.title}</b> — {t.status}
        </div>
      ))}
    </div>
  );
}
