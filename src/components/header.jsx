

import React from 'react';
import { useTheme } from '../layout/ThemeContext';
import {image} from '../db' 

const placeholderLightLogo = image[0].image3;
const placeholderDarkLogo = image[0].image1;


// --- Theme Icons ---
const SunIcon = () => (
  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5" />
    <g stroke="currentColor">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);


const MoonIcon = () => (
  <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.58 9.79z" />
  </svg>
);

// --- End Theme Icons ---

export default function Header() {
  const { theme, toggleTheme } = useTheme(); // Get theme state and toggle function

  // Determine which logo to use based on the current theme
  // Replace these with your actual logo variables from your db or imports
  const currentLogo = theme === 'dark' ? placeholderDarkLogo : placeholderLightLogo;
  // Example if you had `image` array with light/dark versions:
  // const currentLogo = theme === 'dark' ? image[0].darkImage : image[0].lightImage;


  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  return (
    <header className={`
      shadow-md fixed top-0 left-0 w-full z-50
      transition-colors duration-300 ease-in-out
      ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-zinc-900 border-b border-gray-200'}
    `}>
      <div className='container mx-auto flex items-center justify-between px-4 sm:px-6 py-3'>
        <a href="/" className="flex items-center">
          <img
            className='h-8 sm:h-10 w-auto' // Adjusted height for responsiveness
            src={currentLogo} // Use the theme-appropriate logo
            alt="Agent.ai Logo"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x50/cccccc/000000?text=Logo+Error"; }} // Basic fallback
          />
        </a>

        {/* Desktop Navigation (currently commented out) */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* <a href="/features" className={`${theme === 'dark' ? 'hover:text-zinc-300' : 'hover:text-indigo-600'} transition-colors duration-200`}>Features</a> */}
          {/* <a href="/pricing" className={`${theme === 'dark' ? 'hover:text-zinc-300' : 'hover:text-indigo-600'} transition-colors duration-200`}>Pricing</a> */}
          {/* <a href="/about" className={`${theme === 'dark' ? 'hover:text-zinc-300' : 'hover:text-indigo-600'} transition-colors duration-200`}>About Us</a> */}
        </nav>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`
              p-2 rounded-full
              ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'}
              focus:outline-none focus:ring-2
              ${theme === 'dark' ? 'focus:ring-yellow-500 focus:ring-offset-zinc-800' : 'focus:ring-indigo-500 focus:ring-offset-gray-100'}
              transition-all duration-200 ease-in-out
            `}
            aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Desktop Log In Button */}
          <div className="hidden md:block">
            <a href="/login" className={`
                font-medium py-2 px-4 rounded-md
                transition-colors duration-200 ease-in-out
                ${theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white' // Or a different style for light mode
                }
            `}>
              Log In
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`
                p-2 rounded-md
                ${theme === 'dark' ? 'text-zinc-300 hover:text-white focus:bg-zinc-700' : 'text-zinc-600 hover:text-zinc-900 focus:bg-gray-200'}
                focus:outline-none
              `}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> // X icon
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg> // Hamburger icon
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`
            md:hidden absolute top-full left-0 w-full shadow-lg py-2
            ${theme === 'dark' ? 'bg-zinc-800 border-t border-zinc-700' : 'bg-gray-100 border-t border-gray-200'}
        `}>
          <div className="px-4 py-2">
            <a href="/login" className={`
                block w-full text-center font-medium py-2.5 px-4 rounded-md
                transition-colors duration-200 ease-in-out
                ${theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }
            `}>
              Log In
            </a>
          </div>
          {/* Add other mobile navigation links here if needed */}
          {/* <a href="/features" className={`block px-4 py-2 ${theme === 'dark' ? 'text-zinc-300 hover:bg-zinc-700' : 'text-zinc-700 hover:bg-gray-200'}`}>Features</a> */}
        </div>
      )}
    </header>
  );
}
