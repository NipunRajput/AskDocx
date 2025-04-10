import React from 'react';
// Correctly import the logo image source.
// Adjust the path if '../assets/1.png' is not correct relative to this Header component file.
// Common patterns might be '/src/assets/1.png' or using an alias like '@/assets/1.png'.
import {image} from '../db';

// It's often better practice to use the semantic <header> tag
export default function Header() {
  return (
    // Use <header> for semantic HTML
    // Added shadow-md for subtle depth
    // Increased z-index to z-50 to ensure it stays on top
    // Added text-white for potential text links inside
    // Added left-0 for clarity with fixed positioning
    <header className='bg-zinc-800 text-white shadow-md fixed top-0 left-0 w-full z-50'>
      {/* Use a container for max-width and centering (optional, remove mx-auto if full-bleed desired) */}
      {/* Use flexbox for layout: items-center for vertical alignment, justify-between for spacing */}
      {/* Adjusted padding: py-3 for vertical padding, px-4 or px-6 for horizontal */}
      <div className='container mx-auto flex items-center justify-between px-6 py-3'>

        {/* Logo Section - Wrapped in a link to the homepage */}
        <a href="/" className="flex items-center"> {/* Make logo clickable */}
          <img
            // Control height (e.g., h-10) and let width adjust automatically (w-auto)
            // Removed excessive margins/paddings (pl-10, mt-10, pb-10)
            // Removed cursor-pointer as the 'a' tag handles it
            className='h-10 w-auto' // Adjust height as needed
            src={image[0].image}        // Use the imported image source variable
            alt="Agent.ai Logo"  // Use descriptive alt text from image
          />
          {/* Optional: Add site name text next to logo */}
          {/* <span className="ml-3 text-xl font-semibold">Agent.ai</span> */}
        </a>

        {/* Navigation Links (Example) */}
        {/* Added hidden md:flex to hide on small screens and show as flex row on medium+ */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/features" className="hover:text-zinc-300 transition-colors duration-200">Features</a>
          <a href="/pricing" className="hover:text-zinc-300 transition-colors duration-200">Pricing</a>
          <a href="/about" className="hover:text-zinc-300 transition-colors duration-200">About Us</a>
          {/* Add more links as needed */}
        </nav>

        {/* Call to Action / User Section (Example) */}
        {/* Added hidden md:block to hide on small screens */}
        <div className="hidden md:block">
          <a href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200">
            Log In
          </a>
          {/* Or user profile info */}
        </div>

        {/* Mobile Menu Button (Placeholder for smaller screens) */}
        {/* Added md:hidden to show only on small screens */}
        <div className="md:hidden">
          <button className="text-white focus:outline-none">
            {/* You would typically use an SVG icon here for the hamburger menu */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          {/* Add state and logic here to toggle a mobile menu */}
        </div>

      </div>
    </header>
  );
}