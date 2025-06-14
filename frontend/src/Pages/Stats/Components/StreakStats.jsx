import React from 'react'

const StreakStats = ({commits}) => {
//sort dates
const dates=Object.entries(commits)
.filter(([date,count])=>count>0)
.map(([date,count])=>new Date(date))
.sort((a,b)=>a-b)



//loop thru and check if each date is exactly 1 day aparat from last
//if yes increment currentStreak
//track the longestStreak as well
let currentStreak=1
let longestStreak=1
let i=0;
for( i=1;i<dates.length;i++)
{
    const diffInDays=(dates[i]-dates[i-1])/(1000*60*60*24)

if(diffInDays===1)
{
    currentStreak++;
    longestStreak=Math.max(longestStreak,currentStreak)

}else{
    currentStreak=1;
}

}


 return (
    <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-yellow-600 shadow-md p-6 rounded-xl w-full text-white mt-6">
      <h2 className="text-xl font-semibold text-yellow-400 text-center mb-4 tracking-wide drop-shadow">
        🔥 Streak Stats
      </h2>
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-1">
          Current Streak: <span className="text-white font-semibold">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
        </p>
        <p className="text-sm text-gray-400">
          Longest Streak: <span className="text-white font-semibold">{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</span>
        </p>
      </div>
    </div>
  );
}

export default StreakStats
