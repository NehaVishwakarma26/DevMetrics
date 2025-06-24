import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import {saveStats} from "../services/api"
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
const DashboardLayout = () => {

const {user}=useAuth()

  console.log("DashboardLayout rendered");
useEffect(()=>{
  const syncGithubStats=async ()=>{
    try{
      const res=await saveStats();
      console.log("github stats synced",res.data)
    }
    catch(err)
    {
      console.error("failed to sync github stats")
    }
  }

  if(user?.username)
  syncGithubStats();
},[user?.username])
  return (
    <div className="flex h-screen bg-gradient-to-tr from-gray-900 via-[#0f172a] to-black text-white" style={{fontFamily:'Hubot Sans'}}>
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-4 bg-[#0f172a] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
