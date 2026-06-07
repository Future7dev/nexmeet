import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("vc_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("vc_token") || null);

  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("vc_user", JSON.stringify(userData));
    localStorage.setItem("vc_token", authToken);
  }

  function updateUser(userData) {
    setUser(userData);
    localStorage.setItem("vc_user", JSON.stringify(userData));
    if (userData.token) {
      setToken(userData.token);
      localStorage.setItem("vc_token", userData.token);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vc_user");
    localStorage.removeItem("vc_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
