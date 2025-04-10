import React from 'react';
import logoSrc from '../assets/1.png';
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    // Use semantic footer tag
    // Added mt-16 for spacing from content above (adjust as needed)
    // Base text color set for the footer area
    <footer className="bg-zinc-800 text-zinc-400 mt-16">
      {/* Container for max-width, centering, and padding */}
      {/* Check in dev tools if container/mx-auto/px-6/py-8 are applying */}
      <div className="container mx-auto px-6 py-8">
        {/* Flex container for layout */}
        {/* Check in dev tools if flex/flex-col/items-center/md:flex-row/md:justify-between are applying */}
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          {/* Left Section: Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            {/* Logo linked to homepage */}
            {/* Check in dev tools if this 'a' and nested 'img' exist */}
            <a href="/" className="block mb-4">
              {/* Check computed styles for img: width, height, src. Add a temporary border if needed: className="h-8 w-auto border border-red-500" */}
              <img
                className="h-8 w-auto" // Expecting 2rem height
                src={logoSrc}
                alt="Agent.ai Logo" // Check if alt text appears if image fails to load
              />
            </a>
            {/* Copyright Text */}
            {/* Check in dev tools if this 'p' tag exists. Check computed color and font-size. Try temporary color: className="text-sm text-center md:text-left text-yellow-400" */}
            <p className="text-sm text-center md:text-left ml-100">
              &copy; {currentYear} Agent.ai. All rights reserved.
            </p>
          </div>
          {/* Right Section: Footer Links */}
          {/* Check in dev tools if this div and nested 'a' tags exist */}
          <div className="flex items-center space-x-6">
            {/* Check computed color. Try temporary color: className="text-sm hover:text-white transition-colors duration-200 text-green-400" */}
            <a href="/privacy" className="text-sm hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="/terms" className="text-sm hover:text-white transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}