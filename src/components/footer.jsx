import React from 'react';
import {image} from '../db';


export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-zinc-800 text-zinc-400 mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <a href="/" className="block mb-4">
              <img
                className="h-8 w-auto"
                src={image[0].image}
                alt="AskDocx Logo"
              />
            </a>
            <p className="text-sm text-center md:text-left">
              &copy; {currentYear} AskDocx. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/privacy" className="text-sm hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="/terms" className="text-sm hover:text-white transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}