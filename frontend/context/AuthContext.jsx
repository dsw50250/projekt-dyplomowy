"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        name: payload.name || payload.username || payload.email || "User",
        role: payload.role || payload.user_role || payload.position || "unknown",
      };
    } catch (err) {
      console.error("Ошибка декодирования токена:", err);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      const decodedUser = decodeToken(storedToken);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        logout();
      }
    }
  }, []);

  const login = async (email, password) => {
  try {
    const res = await api.post("/users/login", { email, password });
    const { token: newToken, user: loggedUser } = res.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    let finalUser;

    if (loggedUser && loggedUser.role) {
      finalUser = loggedUser;
    }
    else {
      const decoded = decodeToken(newToken);
      if (decoded) {
        finalUser = decoded;
      } else {
        finalUser = { name: email.split("@")[0], role: "unknown" };
      }
    }

    setUser(finalUser); 
    console.log("Залогинен пользователь:", finalUser);

    router.push("/dashboard");
  } catch (err) {
    console.error("Login failed", err);
    throw err;
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);