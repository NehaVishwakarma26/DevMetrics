import React from 'react';

const TodayProgress = ({ todayCommits, dailyGoal }) => {
  // Calculate percentage of goal achieved
  const percent = Math.min(100, Math.round((todayCommits / dailyGoal) * 100));

  return (
    <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] border border-purple-700 shadow-lg p-6 rounded-xl w-full text-white">
      {dailyGoal && (
        <div>
          <h3 className="text-2xl font-bold mb-4 text-teal-400 text-center tracking-wide drop-shadow-lg border-b border-teal-600 pb-2">
            Today's Progress
          </h3>
          
          <p className='text-sm text-gray-400 mb-1'>
            Commits Today: <span className='text-white font-semibold'> {todayCommits}</span>
          </p>
          
          <p className='text-sm text-gray-400 mb-1'>
            Daily Goal: <span className='text-white font-semibold'> {dailyGoal}</span>
          </p>
          
          <p className='text-sm text-gray-400 mb-1'>
            Progress: <span className='text-white font-semibold'> {percent}%</span>
          </p>

          <div className='bg-gray-800 rounded-full h-4 w-full overflow-hidden mt-4'>
            <div
              className='bg-gradient-to-r from-teal-400 to-purple-500 transition-all duration-500 ease-in-out shadow-md ring-1 ring-teal-500 h-full'
              style={{ width: `${percent}%`, minWidth: percent > 0 ? '4px' : '0' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayProgress;
