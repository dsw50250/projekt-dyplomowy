"use client";
import { useState } from "react";
import { loginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await loginRequest(email, password);
      login(data.token);
      router.push("/dashboard");
    } catch (err) {
      alert("Ошибка входа");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button>Login</button>
      </form>
    </div>
  );
}
