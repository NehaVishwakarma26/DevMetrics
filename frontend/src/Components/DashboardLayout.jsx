import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  console.log("DashboardLayout rendered");

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-0">
          <Outlet />  {/* This renders the nested pages like Dashboard, Goals, Stats */}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
