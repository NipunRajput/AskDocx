import React from 'react';
import { useTheme } from '../layout/ThemeContext';
import { image } from '../db';

export default function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  // Choose logo based on theme
  const currentLogo = theme === 'dark' ? image[0].image1 : image[0].image3;

  return (
    <footer
      className={`
        w-full z-50 transition-colors duration-300 ease-in-out
        ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-zinc-800 border-t border-gray-200'}
      `}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          {/* Left side: Logo + Copyright */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <a href="/" className="block mb-4">
              <img
                className="h-8 sm:h-10 w-auto"
                src={currentLogo}
                alt="AskDocx Logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/150x50/cccccc/000000?text=Logo+Error";
                }}
              />
            </a>
            <p className="text-sm text-center md:text-left">
              &copy; {currentYear} AskDocx. All rights reserved.
            </p>
          </div>

          {/* Right side: Links */}
          <div className="flex items-center space-x-6">
            <a href="/privacy" className={`
              text-sm transition-colors duration-200
              ${theme === 'dark' ? 'hover:text-white' : 'hover:text-indigo-600'}
            `}>
              Privacy Policy
            </a>
            <a href="/terms" className={`
              text-sm transition-colors duration-200
              ${theme === 'dark' ? 'hover:text-white' : 'hover:text-indigo-600'}
            `}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
