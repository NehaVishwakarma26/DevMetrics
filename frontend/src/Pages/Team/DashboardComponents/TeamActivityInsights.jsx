import React, { useEffect, useState } from "react";
import axios from "axios";
import {getTeamActivityInsights} from "../../../services/api"

const TeamActivityInsights = ({ teamId,repo }) => {
  const [commits, setCommits] = useState(0);
  const [prs, setPrs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getTeamActivityInsights(teamId,{repo:repo})
        console.log(res.data);
        setCommits(res.data.totalCommits);
        setPrs(res.data.totalPRs);
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [teamId]);

  if (loading) return <p className="text-gray-400">Loading insights...</p>;

  return (
    <div className="bg-purple-900 rounded-2xl p-6 mt-6 text-white shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Team Activity Insights (Last 7 Days)</h3>
      <div className="flex gap-6">
        <div className="bg-gray-900 p-4 rounded-xl w-1/2 text-center">
          <p className="text-sm text-gray-300">Total Commits</p>
          <p className="text-2xl font-bold text-teal-300">{commits}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl w-1/2 text-center">
          <p className="text-sm text-gray-300">Total PRs</p>
          <p className="text-2xl font-bold text-yellow-300">{prs}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamActivityInsights;
