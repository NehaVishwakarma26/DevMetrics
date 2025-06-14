import React from "react";
import { Link } from "react-router-dom";
import Features from "./Features";
import GithubPreview from "./GithubPreview";
const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight" style={{ fontFamily: "'Hubot Sans', sans-serif" }}>
          DevMetrics
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        
       
          <Link to="/login">
            <button className="ml-4 px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Login
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
