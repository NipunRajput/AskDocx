import Header from "./components/header";
import Footer from "./components/footer";
import MainContent from "./pages/MainContent";
import Result from "./pages/Result";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router> 
      <>
        <Header />
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/result" element={<Result />} />
        </Routes>
        <Footer />
      </>
    </Router>
  );
}