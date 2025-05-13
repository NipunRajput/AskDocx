import {createContext, useContext, useState, useEffect} from "react";
 const API = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({children}) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user,  setUser]  = useState(
  JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(false);


/* ---------- HELPERS ---------- */

const saveSession = (jwt, userObj) => {
  localStorage.setItem("token", jwt);
  localStorage.setItem("user",  JSON.stringify(userObj));
  setToken(jwt);
  setUser(userObj);
};

const register = async (email, password) => {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  // localStorage.setItem("token", json.token);
  // setToken(json.token);
// backend returns only the token, so we store the email locally
  saveSession(json.token, { email });
};

const login = async (email, password) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  // localStorage.setItem("token", json.token);
  // setToken(json.token);
  saveSession(json.token, { email });
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setToken(null);
  setUser(null);
};

  const value = { token, user, register, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
