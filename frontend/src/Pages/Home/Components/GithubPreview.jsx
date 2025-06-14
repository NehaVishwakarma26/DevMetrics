import React from "react";

const GithubPreview = () => {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            style={{ fontFamily: "'Hubot Sans', sans-serif" }}
          >
            Track Your GitHub Productivity Smarter
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            View commit trends, hit daily goals, and stay consistent with smart suggestions — all in a sleek, dashboard.
          </p>
        </div>

        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-3 w-full max-w-sm">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4 text-center">
            📊 Weekly Commits
          </h3>
          <div className="flex items-end gap-2 h-32 justify-center">
            {[30, 45, 20, 60, 10, 35, 50].map((height, i) => (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className="w-6 bg-indigo-500 rounded"
              ></div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            Sample bar chart based on past 7 days
          </p>
        </div>
      </div>
    </section>
  );
};

export default GithubPreview;
