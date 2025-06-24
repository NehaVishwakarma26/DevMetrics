import React from 'react'

const TeamOverview = ({ teamName, createdBy, members, currentUser, isAdmin }) => {
  return (
    <div className="w-full bg-purple-950 text-white px-6 py-4 rounded-2xl flex justify-between items-center shadow-lg">
      <div>
        <h2 className="text-xl font-bold">{teamName}</h2>
        <p className="text-sm text-gray-300">Created by {createdBy}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="bg-teal-600 px-3 py-1 rounded-xl text-sm">
          Members: {members.length}
        </span>
        <span className="bg-purple-700 px-3 py-1 rounded-xl text-sm">
          Role: {isAdmin ? 'Admin' : 'Member'}
        </span>
       
      </div>

      
    </div>
  );
};


export default TeamOverview
