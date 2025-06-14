import React from 'react'
import {BarChart,Bar,XAxis,YAxis,Tooltip,CartesianGrid,ResponsiveContainer} from "recharts"

const CommitsBarChart = ({commitCounts}) => {
  return (
    <div>
      {/* Commit bar chart */}
      <h3>Commits - Last 7 days</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={commitCounts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commits" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CommitsBarChart
