import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const WeeklyLineChart = ({ commits }) => {
  return (
    <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-violet-600 shadow-md p-6 rounded-xl w-full text-white mt-6">
      <h2 className="text-xl font-semibold text-violet-400 text-center mb-4 tracking-wide drop-shadow">
        📈 Weekly Commit Trends
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={commits} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #8b5cf6", color: "#fff" }}
            labelStyle={{ color: "#d8b4fe" }}
          />
          <Line
            type="monotone"
            dataKey="commits"
            stroke="#a78bfa"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#ddd6fe", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyLineChart;
