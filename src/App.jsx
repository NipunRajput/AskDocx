import Header from "./components/header";
import Footer from "./components/footer";
import MainContent from "./pages/MainContent";
import Result from "./pages/Result";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      {/* Wrapper Div:
          - flex flex-col: Arranges children (Header, main, Footer) vertically.
          - min-h-screen: Ensures this wrapper takes at least the full viewport height.
          - bg-neutral-900: Sets the background for the entire app area, preventing white body background from showing.
      */}
      <div className="flex flex-col min-h-screen bg-neutral-900"> {/* Or use bg-zinc-800 if preferred */}

        <Header />

        {/* Main Content Area:
            - <main>: Semantic tag for main content.
            - flex-grow: Tells this element to expand and take up any available vertical space
                       between the Header and Footer, pushing the Footer down.
        */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/result" element={<Result />} />
            {/* Add other routes here */}
          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}