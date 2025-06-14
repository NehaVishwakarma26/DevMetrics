import React from "react";

const GithubPreview = () => {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left Text */}
        <div className="flex-1 text-center md:text-left">
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            style={{ fontFamily: "'Hubot Sans', sans-serif" }}
          >
            See Your GitHub Data Like Never Before
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Contribution heatmaps, streaks, and daily stats – all in one elegant dashboard designed for productivity.
          </p>
        </div>

        {/* Right Mockup */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">🔥 Weekly Overview</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-sm ${
                  i % 3 === 0
                    ? "bg-green-600"
                    : i % 2 === 0
                    ? "bg-green-400"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              ></div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Heatmap mock data based on past 3 weeks
          </p>
        </div>
      </div>
    </section>
  );
};

export default GithubPreview;
