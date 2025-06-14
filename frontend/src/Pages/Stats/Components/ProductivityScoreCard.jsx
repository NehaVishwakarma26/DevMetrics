import React, { useEffect, useState } from 'react';
import { getProductivityScore } from '../../../services/api';

const ProductivityScoreCard = () => {
  const [score, setScore] = useState(null);
  const [breakdown, setBreakdown] = useState({ daily: 0, weekly: 0 });

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await getProductivityScore();
        setScore(res.data.score);
        setBreakdown(res.data.breakdown);
        console.log("Fetched productivity score:", res.data);
      } catch (err) {
        console.error("Error fetching productivity score:", err);
      }
    };

    fetchScore();
  }, []);

  if (score === null) return <div>Loading...</div>;

return (
  <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-purple-700 shadow-lg p-6 rounded-xl w-full text-white">
    <h2 className="text-2xl font-bold text-center text-teal-400 mb-4">
      📊 Productivity Score
    </h2>

    <div className="text-5xl font-extrabold text-center text-purple-400 mb-6">
      {score} <span className="text-xl text-gray-400">/ 100</span>
    </div>

    <div className="space-y-4">
      {/* Daily Goal */}
      <div>
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-300">
          <span>✅ Daily Commit Goal</span>
          <span className="text-teal-400">{breakdown.daily}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-teal-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${breakdown.daily}%` }}
          ></div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div>
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-300">
          <span>🚀 Weekly PR Goal</span>
          <span className="text-purple-400">{breakdown.weekly}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${breakdown.weekly}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

};

export default ProductivityScoreCard;
