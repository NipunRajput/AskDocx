import Header from "./components/header";
import Footer from "./components/footer";
import MainContent from "./pages/MainContent";
import Result from "./pages/Result";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}