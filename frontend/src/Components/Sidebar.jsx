// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Goal,
  BarChart,
  Settings,
} from "lucide-react";

const Sidebar = () => {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
      isActive ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white border-r p-4">
      <div className="space-y-2">
        <NavLink to="/dashboard" className={linkClasses}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/goals" className={linkClasses}>
          <Goal size={20} />
          My Goals
        </NavLink>
        <NavLink to="/dashboard/stats" className={linkClasses}>
          <BarChart size={20} />
          My Stats
        </NavLink>
    
      </div>
    </aside>
  );
};

export default Sidebar;
