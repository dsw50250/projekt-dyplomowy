"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("=== КНОПКА LOGIN НАЖАТА ===");
    console.log("Отправляем на логин:", { email, password });

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <i className="fas fa-tasks text-6xl text-indigo-600 mb-4"></i>
          <h1 className="text-4xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your task management system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Login
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Demo accounts:</p>
          <p className="mt-2">
            Manager: <code className="bg-gray-100 px-2 py-1 rounded">manager@example.com</code> / 1
          </p>
          <p>
            Developer: <code className="bg-gray-100 px-2 py-1 rounded">bob@example.com</code> / 1
          </p>
        </div>
      </div>
    </div>
  );
}