import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
const handleclick=()=>{
navigate("/login")
}

  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-[#e8ecf1] to-[#dee2e6] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155] overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-repeat pointer-events-none"></div>

      <div className="z-10 text-center max-w-2xl px-6">
        <h1
          className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight"
          style={{ fontFamily: "'Hubot Sans', sans-serif" }}
        >
          Track Your GitHub Productivity Like Never Before
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
          Stay focused. Hit your goals. Visualize your coding streaks and build
          unstoppable momentum.
        </p>

        <div className="flex justify-center gap-4">
          <button onClick={handleclick} className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-semibold hover:scale-105 transition transform duration-200 shadow-md">
            Get Started
          </button>
         
        </div>
      </div>
    </section>
  );
};

export default Hero;
