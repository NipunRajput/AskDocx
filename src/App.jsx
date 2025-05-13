// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header       from "./components/header";
import Footer       from "./components/footer";
import MainContent  from "./pages/MainContent";
import Result       from "./pages/Result";
import AuthPage     from "./auth/Login";      // ⬅ adjust name/path if different
import Register     from "./auth/Register";

import { useAuth }  from "./auth/AuthContext";  // ⬅ make sure this file exists
import ForgotPassword from './auth/ForgotPassword';

/* ───────────────────────────────
   Route-guard helpers
   ─────────────────────────────── */
function RequireAuth({ children }) {
  const { token } = useAuth();
  /* console.log("RequireAuth token =", token); */   
  return token ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
}


/* ───────────────────────────────
   App-root
   ─────────────────────────────── */

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Header />

        <main className="flex-grow">
          <Routes>
            {/* ── public (hidden if logged-in) ─────────────── */}
            <Route
              path="/login"
              element={
                <RedirectIfAuth>
                  <AuthPage />
                </RedirectIfAuth>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuth>
                  <Register />
                </RedirectIfAuth>
              }
            />

            {/* ── private ─────────────────────────────────── */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <MainContent />
                </RequireAuth>
              }
            />
            <Route
              path="/result"
              element={
                <RequireAuth>
                  <Result />
                </RequireAuth>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* ── catch-all ───────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
