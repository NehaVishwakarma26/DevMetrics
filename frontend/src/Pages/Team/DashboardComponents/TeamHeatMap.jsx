import React, { useEffect, useState } from "react";
import { sevenDayContribution } from "../../../services/api";

const TeamHeatMap = ({ teamId, repo }) => {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await sevenDayContribution(teamId, { repo: repo });
        console.log(response);
        setContributions(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchdata();
  }, []);

  return (
    <div className="grid gap-6 mt-6 bg-purple-700 p-5 rounded-2xl">
      <h2 className="text-xl font-bold text-white">Team Heat Map</h2>

      {contributions.map(({ memberData, stats }) => {
        const activeDays = stats.filter((day) => day.commits > 0).length;

        return (
          <div
            key={memberData._id}
            className="p-4 border rounded-lg shadow bg-gray-900 text-white"
          >
            <div className="flex items-center gap-4 mb-2">
              <img
                src={memberData.avatar}
                alt={memberData.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium text-lg">{memberData.username}</span>
            </div>

            <div className="flex gap-2 mb-2">
              {stats.map((stat, index) => {
                const intensity =
                  stat.commits === 0
                    ? "bg-gray-700"
                    : stat.commits < 5
                    ? "bg-green-500"
                    : stat.commits < 15
                    ? "bg-green-600"
                    : "bg-green-700";

                return (
                  <div
                    key={index}
                    title={`${new Date(stat.date).toDateString()}: ${
                      stat.commits
                    } commits`}
                    className={`w-6 h-6 ${intensity} rounded-md`}
                  />
                  
                );
              })}
            </div>

            <p className="text-sm text-gray-300">Active Days: {activeDays}/7</p>
          </div>
        );
      })}
    </div>
  );
};

export default TeamHeatMap;
