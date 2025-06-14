import React from "react";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-6 px-4 border-t border-gray-300 dark:border-gray-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} DevMetrics. Built with 💻 by Neha.
        </p>
        <a
          href="https://github.com/yourusername/devmetrics"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:underline"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
