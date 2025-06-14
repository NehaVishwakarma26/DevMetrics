import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/analytics", {
        withCredentials: true,
      });
      console.log("Im in dashboard.jsx")
      console.log(data)
      setAnalytics(data);
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading your dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {analytics.username} 👋
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Public Repos" value={analytics.public_repos} />
        <StatCard label="Followers" value={analytics.followers} />
        <StatCard label="Following" value={analytics.following} />
        <StatCard
          label="GitHub Since"
          value={new Date(analytics.created_at).toLocaleDateString()}
        />
      </div>

      <div className="mt-6 bg-white rounded-xl shadow p-6 flex items-center space-x-6">
        <img
          src={analytics.avatar_url}
          alt="avatar"
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {analytics.username}
          </h2>
          <p className="text-gray-600">{analytics.bio || "No bio available"}</p>
          <a
            href={analytics.profile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-sm"
          >
            View GitHub Profile
          </a>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default Dashboard;
