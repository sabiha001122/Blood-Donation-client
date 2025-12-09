// AuthContext keeps track of the logged-in user and JWT token.
// It exposes login, register, and logout helpers that talk to the backend.
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // On first render, if a token exists, fetch the current user.
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data || res.data.user || res.data);
      } catch (error) {
        console.error("Failed to load current user, clearing token.", error);
        handleLogout(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const saveAuth = (jwtToken, userData) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: jwtToken, user: userData } = res.data.data;
      saveAuth(jwtToken, userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const { token: jwtToken, user: userData } = res.data.data;
      saveAuth(jwtToken, userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, message };
    }
  };

  const handleLogout = (shouldNavigate = true) => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    if (shouldNavigate) {
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: Boolean(token),
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook to consume the context.
export const useAuth = () => useContext(AuthContext);
