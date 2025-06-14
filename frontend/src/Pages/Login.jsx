import React from "react";
import {Github} from "lucide-react"

const Login = () => {
  const handleLogin = () => {
    // This redirects the browser (not an axios call)
    window.location.href = "http://localhost:5000/api/github/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="relative bg-white/80 dark:bg-gray-800/70 backdrop-blur-large p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-gray-700 ">
        <div className="absolute -top-10 left-1/2 translate-x-[-50%]
          w-20 h-20 bg-blue-500 blur-2xl rounded-full opacity-30">
        </div>

        <div className="flex justify-center mb-4">
          <Github className="h-10 w-10 text-blue-500 dark:text-white hover:scale-120 transition duration-300" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Welcome
        </h2>
      <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 text-white py-2.5 px-4 rounded-xl  items-center justify-center "
        >
          <span>Login with GitHub</span>
        </button>

        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-4">
          By creating an account you agree to our terms and services
        </p>
      </div>
    </div>
  );
};

export default Login;
