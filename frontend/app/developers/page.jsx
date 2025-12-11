"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

export default function Developers() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [developers, setDevelopers] = useState([]);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
    if (token) loadDevelopers();
  }, [token, loading]);

  async function loadDevelopers() {
    const res = await api.get("/users/developers");
    setDevelopers(res.data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Developers</h1>
      {developers.map(d => (
        <div key={d.id}>
          <b>{d.name}</b> — {d.email}
        </div>
      ))}
    </div>
  );
}
