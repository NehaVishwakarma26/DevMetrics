import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-3 mt-auto">
      &copy; {new Date().getFullYear()} DevMetrics. All rights reserved.
    </footer>
  );
};

export default Footer;
