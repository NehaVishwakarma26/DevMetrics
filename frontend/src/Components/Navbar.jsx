// src/components/layout/Navbar.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("https://devmetrics-api.onrender.com/api/github/logout", {},{
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-gray-200 border-b shadow-sm">
      <div className="text-xl font-bold text-purple-400">DevMetrics</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src={user?.avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full border"
          />
          <span className="font-medium text-gray-300">
            {user?.username || "User"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
