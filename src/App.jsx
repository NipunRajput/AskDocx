import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import MainContent from "./pages/MainContent";
import Result from "./pages/Result";
import AuthPage from "./auth/login";
import PrivateRoute from "./auth/PrivateRoute";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Header />   {/* Header already shows profile / logout when logged in */}

        <main className="flex-grow">
          <Routes>
            {/* ── Protected area ───────────────────────────────────── */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<MainContent />} />
              <Route path="/result" element={<Result />} />
            </Route>

            {/* ── Public route ─────────────────────────────────────── */}
            <Route path="/login" element={<AuthPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
