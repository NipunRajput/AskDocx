import { useEffect } from "react";
import { Link } from "react-router-dom";
import {image} from '../db'
export default function Landing() {
  useEffect(() => {
    document.getElementById("currentYear").textContent = new Date().getFullYear();
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    const nav = document.querySelector("nav");

    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        nav.classList.add("shadow-xl", "bg-gray-900/95");
        nav.classList.remove("bg-gray-900/80");
      } else {
        nav.classList.remove("shadow-xl", "bg-gray-900/95");
        nav.classList.add("bg-gray-900/80");
      }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
          if (!mobileMenu.classList.contains("hidden")) {
            mobileMenu.classList.add("hidden");
          }
        }
      });
    });
  }, []);

  return (
    <div className="scroll-smooth bg-gray-900 text-gray-300 font-inter">
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 transition-all duration-300 bg-gray-900/80 backdrop-blur-md shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            <img
            className='h-8 sm:h-10 w-auto' // Adjusted height for responsiveness
            src={image[0].image1} // Use the theme-appropriate logo
            alt="Agent.ai Logo"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x50/cccccc/000000?text=Logo+Error"; }} // Basic fallback
          />
          </a>
          <div className="hidden md:flex space-x-6 items-center">
            <a href="#features" className="text-gray-300 hover:text-indigo-400 transition duration-300">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-indigo-400 transition duration-300">How It Works</a>
            <a href="#use-cases" className="text-gray-300 hover:text-indigo-400 transition duration-300">Use Cases</a>
            <Link to="/login" className="text-gray-300 hover:text-indigo-400 transition duration-300">Login</Link>
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md">
              Sign Up
            </Link>
          </div>
          <div className="md:hidden">
            <button id="mobile-menu-button" className="text-gray-300 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
        <div id="mobile-menu" className="hidden md:hidden mt-3 space-y-2 px-2 pb-3">
          <a href="#features" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">Features</a>
          <a href="#how-it-works" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">How It Works</a>
          <a href="#use-cases" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">Use Cases</a>
          <Link to="/login" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">Login</Link>
          <Link to="/signup" className="block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-center">Sign Up</Link>
        </div>
      </nav>

      <main className="pt-24">
        {/* All content sections */}
        <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-4 py-20 relative text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Converse</span> with Your Documents.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mb-10">
            Stop searching, start understanding. Upload your PDFs or DOCX files, ask questions, and get intelligent answers in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/upload" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-lg text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out">
              Upload Document & Ask
            </Link>
            <Link to="/history" className="border-2 border-indigo-500 text-indigo-400 font-semibold py-3.5 px-10 rounded-lg text-lg hover:bg-indigo-500 hover:text-white transition duration-300 ease-in-out transform hover:scale-105">
              View Chat History
            </Link>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-gray-800/30 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Instant Insights in <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">3 Simple Steps</span></h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">Getting started with AskDocx is quick and intuitive.</p>
          <div className="grid md:grid-cols-3 gap-12 px-6">
            {[
              {
                title: "Upload Securely",
                description: "Drag & drop or select your PDF or DOCX file. Your data is handled with utmost security.",
                iconColor: "bg-indigo-500",
              },
              {
                title: "AI Processing",
                description: "Our advanced AI meticulously analyzes your document's content and structure.",
                iconColor: "bg-purple-500",
              },
              {
                title: "Ask & Understand",
                description: "Engage in a natural conversation. Ask questions and receive precise, context-aware answers.",
                iconColor: "bg-pink-500",
              }
            ].map((step, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/70 rounded-xl p-8 backdrop-blur-md">
                <div className={`${step.iconColor} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-2xl font-bold">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Continue with Features, Use Cases, and Uploader Sections (can be modularized if needed) */}
      </main>

      <footer className="py-12 bg-gray-800/50 border-t border-gray-700/50">
        <div className="container mx-auto px-6 text-center">
          <a href="#" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 inline-block">
            AskDocx
          </a>
          <div className="space-x-6 mb-4">
            <a href="#" className="text-gray-400 hover:text-indigo-400">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-indigo-400">Terms of Service</a>
            <a href="mailto:support@askdocx.com" className="text-gray-400 hover:text-indigo-400">Contact Us</a>
          </div>
          <p className="text-gray-500 text-sm">&copy; <span id="currentYear"></span> AskDocx. All rights reserved. Your intelligent document companion.</p>
        </div>
      </footer>
    </div>
  );
}
