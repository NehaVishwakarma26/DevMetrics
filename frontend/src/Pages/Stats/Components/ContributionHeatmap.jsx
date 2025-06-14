import React from "react";

// Generate last N days in ISO format (YYYY-MM-DD)
function getLastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }
  return days.reverse(); // chronological order
}

// Group days into weeks (each week = 7 entries)
function groupByWeek(dates) {
  const weeks = [];
  let week = [];

  dates.forEach((date) => {
    const day = new Date(date).getDay(); // 0 = Sunday
    if (week.length === 0 && day !== 0) {
      // Fill empty spots at the beginning
      for (let i = 0; i < day; i++) week.push(null);
    }

    week.push(date);

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  // Pad the last week
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

// Get color based on commit count
function getColorForCount(count) {
  if (count >= 5) return "#216e39";
  if (count >= 3) return "#30a14e";
  if (count >= 1) return "#40c463";
  return "#ebedf0";
}

// Get month labels aligned with week columns
function getMonthLabels(weeks) {
  const labels = [];
  let prevMonth = "";

  weeks.forEach((week, i) => {
    const firstValidDate = week.find((d) => d);
    if (!firstValidDate) return;

    const month = new Date(firstValidDate).toLocaleString("default", {
      month: "short",
    });

    if (month !== prevMonth) {
      labels.push({ index: i, label: month });
      prevMonth = month;
    }
  });

  return labels;
}

const ContributionHeatmap = ({ commits }) => {
  const last180days = getLastNDays(180);
  const weeks = groupByWeek(last180days);
  const monthLabels = getMonthLabels(weeks);

  return (
    <div className="overflow-x-auto p-6">
      <h1 className="text-center text-lg font-semibold mb-4">
        Contribution Heatmap
      </h1>

      {/* Month Labels */}
      <div className="flex mb-2 ml-6">
        {weeks.map((_, i) => {
          const label = monthLabels.find((m) => m.index === i);
          return (
            <div
              key={i}
              className="w-4 text-[10px] text-gray-500 text-center"
            >
              {label ? label.label : ""}
            </div>
          );
        })}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-rows-7 grid-flow-col gap-1">
        {weeks.map((week, colIdx) =>
          week.map((date, rowIdx) => (
            <div
              key={`${colIdx}-${rowIdx}`}
              className="w-4 h-4 rounded-sm"
              title={
                date ? `${date} - ${commits[date] || 0} commits` : ""
              }
              style={{
                backgroundColor: getColorForCount(commits[date] || 0),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ContributionHeatmap;
