import { createContext, useContext, useState } from "react";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* reads token from localStorage once on load */
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user,  setUser]  = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(false);

  const saveSession = (jwt, userObj) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userObj));
    setToken(jwt);
    setUser(userObj);
  };

  async function login(email, password) {
    setLoading(true);
    const r = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    setLoading(false);
    if (!j.success) throw new Error(j.error);
    saveSession(j.token, { email });
  }

  async function register(email, password) {
    setLoading(true);
    const r = await fetch("http://127.0.0.1:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    setLoading(false);
    if (!j.success) throw new Error(j.error);
    saveSession(j.token, { email });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
