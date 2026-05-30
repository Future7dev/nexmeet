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

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vc_user");
    localStorage.removeItem("vc_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
