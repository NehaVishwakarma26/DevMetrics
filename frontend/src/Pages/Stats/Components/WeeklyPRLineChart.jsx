import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { getWeeklyPRStats } from '../../../services/api'; // adjust path if needed

const WeeklyPRLineChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchPRStats();
  }, []);

  const fetchPRStats = async () => {
    try {
      const res = await getWeeklyPRStats();
      const formatted = res.data.map((item) => ({
        date: new Date(item.date).toLocaleString('en-US', { weekday: 'short' }),
        PRs: item.pullRequests,
      }));
      setData(formatted);
    } catch (err) {
      console.error('Failed to load PR stats', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-blue-600 shadow-lg p-6 rounded-xl w-full text-white mt-6">
      <h2 className="text-xl font-semibold text-blue-400 text-center mb-4 tracking-wide drop-shadow">
        🔁 Weekly Pull Request Activity
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #3b82f6", color: "#fff" }}
            labelStyle={{ color: "#bfdbfe" }}
          />
          <Line
            type="monotone"
            dataKey="PRs"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ stroke: "#93c5fd", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyPRLineChart;
