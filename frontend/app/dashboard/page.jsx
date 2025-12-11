"use client";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [token, loading]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <div><Link href="/tasks">Tasks</Link></div>
      <div><Link href="/developers">Developers</Link></div>
      <div><Link href="/projects">Projects</Link></div>
      <div><Link href="/skills">Skills</Link></div>
    </div>
  );
}
