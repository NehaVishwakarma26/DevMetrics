import React, { useState, useEffect } from 'react';
import { sevenDayContribution, fetchSuggestions } from "../../../services/api";

const SprintSummary = ({ teamId, repo }) => {
  const [contributions, setContributions] = useState([]);
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await sevenDayContribution(teamId, { repo });
        console.log(response);
        setContributions(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [teamId, repo]);

  const fetchSuggestion = async () => {
    try {
    const prompt = `
Generate a frontend-ready sprint summary.

Context:
Our app displays a weekly sprint summary directly on the frontend dashboard. Below is the contribution data (date-wise commits and PRs) of each member from the last 7 days.

Instructions:
• Write a short and motivating summary (max 4–5 lines).
• DO NOT use markdown formatting like **bold**, *, or lists.
• Output should be plain text.
• Focus on key contribution highlights and performance insights.
• Make sure it's concise, readable, and suitable for a UI card.

Contribution Data:
${contributions.map(member => {
  const lines = member.stats.map(stat =>
    `${new Date(stat.date).toDateString()}: ${stat.commits} commits, ${stat.pullRequests} PRs`
  ).join("\n");
  return `${member.memberData.username}\n${lines}`;
}).join("\n\n")}
`;


      const suggestionText = await fetchSuggestions(prompt);
      setSuggestion(suggestionText.data.summary);
    } catch (err) {
      console.error("Error fetching suggestion:", err);
    }
  };

  return (
   <div className="mt-8 bg-zinc-700 p-6 rounded-xl shadow-md">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-semibold text-purple-400">Sprint Summary</h3>
    <button
      onClick={fetchSuggestion}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow"
    >
      Generate Summary
    </button>
  </div>

  {suggestion.length > 0 ? (
    <pre className="whitespace-pre-wrap text-gray-200">{suggestion}</pre>
  ) : (
    <p className="text-gray-400 italic">Click the button to generate a summary of the past 7 days contributions.</p>
  )}
</div>

  );
};

export default SprintSummary;
