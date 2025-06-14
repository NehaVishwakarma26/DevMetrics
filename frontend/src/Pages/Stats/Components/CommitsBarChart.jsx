import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const CommitsBarChart = ({ commitCounts }) => {
  return (
    <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-indigo-600 shadow-md p-6 rounded-xl w-full text-white">
      <h3 className="text-xl font-semibold mb-4 text-indigo-400 text-center tracking-wide drop-shadow">
        📅 Commits - Last 7 Days
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={commitCounts} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4f46e5", color: "#fff" }}
            labelStyle={{ color: "#a5b4fc" }}
          />
          <Bar dataKey="commits" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitsBarChart;
