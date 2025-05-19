import { useEffect } from "react";
import { Link } from "react-router-dom";
import { image } from '../db';

export default function Landing() {
  useEffect(() => {
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
    <div className="scroll-smooth bg-gray-900 text-gray-300 font-inter min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-5 px-6 md:px-12 transition-all duration-300 bg-gray-900/80 backdrop-blur-md shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            <img
              className="h-8 sm:h-10 w-auto"
              src={image[0].image1}
              alt="Agent.ai Logo"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x50/cccccc/000000?text=Logo+Error"; }}
            />
          </a>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-gray-300 hover:text-indigo-400 transition duration-300 font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-indigo-400 transition duration-300 font-medium">How It Works</a>
            <a href="#use-cases" className="text-gray-300 hover:text-indigo-400 transition duration-300 font-medium">Use Cases</a>
            <Link to="/login" className="text-gray-300 hover:text-indigo-400 transition duration-300 font-medium">Login</Link>
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-indigo-500/30">
              Sign Up
            </Link>
          </div>
          <div className="md:hidden">
            <button id="mobile-menu-button" className="text-gray-300 focus:outline-none p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
        <div id="mobile-menu" className="hidden md:hidden mt-4 space-y-3 px-4 pb-4 pt-2 bg-gray-800/90 backdrop-blur-md rounded-lg">
          <a href="#features" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2.5 rounded-md text-base font-medium">Features</a>
          <a href="#how-it-works" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2.5 rounded-md text-base font-medium">How It Works</a>
          <a href="#use-cases" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2.5 rounded-md text-base font-medium">Use Cases</a>
          <Link to="/login" className="block text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2.5 rounded-md text-base font-medium">Login</Link>
          <Link to="/signup" className="block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 text-center my-2">Sign Up</Link>
        </div>
      </nav>

      <main className="pt-28">
        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex flex-col justify-center items-center px-6 md:px-10 py-24 relative text-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Converse</span> with Your Documents.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Stop searching, start understanding. Upload your files, ask questions, and get intelligent answers in seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-5 sm:space-y-0 sm:space-x-8">
              <Link to="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-lg text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out w-full sm:w-auto">
                Upload Document & Ask
              </Link>
              <Link to="/login" className="border-2 border-indigo-500 text-indigo-400 font-semibold py-3.5 px-10 rounded-lg text-lg hover:bg-indigo-500 hover:text-white transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto">
                View Chat History
              </Link>
            </div>
          </div>
          
          {/* Abstract Background Elements */}
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 bg-gray-800/30 text-center">
          <div className="container mx-auto px-6 md:px-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Instant Insights in <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">3 Simple Steps</span></h2>
            <p className="text-gray-400 mb-16 max-w-2xl mx-auto text-lg">Getting started with Agent.ai is quick and intuitive.</p>
            
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  title: "Upload Securely",
                  description: "Drag & drop or select your file. Your data is handled with utmost security.",
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
                <div key={i} className="bg-gray-800/50 border border-gray-700/70 rounded-xl p-8 md:p-10 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:border-indigo-500/30">
                  <div className={`${step.iconColor} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                    <span className="text-2xl font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32">
          <div className="container mx-auto px-6 md:px-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Powerful <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Features</span></h2>
            <p className="text-gray-400 mb-16 max-w-2xl mx-auto text-lg">Unlock the full potential of your documents with our advanced AI tools.</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800/40 border border-gray-700/70 rounded-xl p-8 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Saved Document Chats</h3>
                <p className="text-gray-400 leading-relaxed">Access your document conversations anytime. All your chats are securely saved for future reference and continuation.</p>
              </div>
              
              <div className="bg-gray-800/40 border border-gray-700/70 rounded-xl p-8 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Fast Responses</h3>
                <p className="text-gray-400 leading-relaxed">Get immediate answers to your questions with our high-performance AI. No more waiting for document analysis.</p>
              </div>
              
              <div className="bg-gray-800/40 border border-gray-700/70 rounded-xl p-8 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Seamless UI</h3>
                <p className="text-gray-400 leading-relaxed">Enjoy a clean, intuitive interface designed for productivity. Upload, chat, and understand documents without complexity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-32 bg-gray-800/30">
          <div className="container mx-auto px-6 md:px-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Versatile <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Use Cases</span></h2>
            <p className="text-gray-400 mb-16 max-w-2xl mx-auto text-lg">See how Agent.ai transforms document interaction across different scenarios.</p>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-gray-800/40 border border-gray-700/70 rounded-xl p-8 md:p-10 text-left shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Document Research</h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                  Extract key insights from complex documents without reading every page. Perfect for researchers, lawyers, and knowledge workers who need to quickly find specific information in large documents.
                </p>
                <div className="mt-auto">
                  {/* <span className="text-indigo-400 font-medium">Learn more →</span> */}
                </div>
              </div>
              
              <div className="bg-gray-800/40 border border-gray-700/70 rounded-xl p-8 md:p-10 text-left shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Quick Study</h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                  Master content quickly with interactive document learning. Ask questions about textbooks, technical manuals, or training materials to rapidly absorb key concepts and information.
                </p>
                <div className="mt-auto">
                  {/* <span className="text-indigo-400 font-medium">Learn more →</span> */}
                </div>
              </div>
  
              <div className="bg-gray-800/40 border border-gray-700/70 rounded-xl p-8 md:p-10 text-left shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full md:col-span-2">
                <div className="bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Keep Everything Local</h3>
                <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                  Privacy-focused document analysis that keeps your sensitive information secure. Your documents are processed locally whenever possible, ensuring confidential data remains private and protected.
                </p>
                <div className="mt-auto">
                  {/* <span className="text-indigo-400 font-medium">Learn more →</span> */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      {/* <footer className="py-16 bg-gray-800/50 border-t border-gray-700/50">
        <div className="container mx-auto px-6 md:px-10 text-center">
          <a href="#" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 inline-block">
            Agent.ai
          </a>
          <div className="space-x-8 mb-6">
            <a href="#" className="text-gray-400 hover:text-indigo-400 transition duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-indigo-400 transition duration-300">Terms of Service</a>
            <a href="mailto:askdocx@gmail.com" className="text-gray-400 hover:text-indigo-400 transition duration-300">Contact Us</a>
          </div>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Agent.ai. All rights reserved. Your intelligent document companion.</p>
        </div>
      </footer> */}
    </div>
  );
}