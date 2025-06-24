import React from 'react'
import TeamMemberCard from "./TeamMemberCard";

const TeamMemberPanel = ({members,createdById,loggedInUserId,isAdmin,onEditClick}) => {
  return (
    <div className='mt-6 bg-purple-900 rounded-2xl p-6 '>
     <div className='flex justify-between'>
            <h3 className='text-xl font-semibold text-white mb-4'>Team Members</h3>

         {isAdmin && (
          <button
            onClick={onEditClick}
            className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1 rounded mb-2"
          >
            ✏️ Edit Team
          </button>
        )}
     </div>
      <div>
        {members.map((member)=>(
            <TeamMemberCard 
            key={member._id}
            member={member}
            isAdmin={member._id===createdById}
            isSelf={member._id===loggedInUserId}
            />
        ))}
      </div>
    </div>
  )
}

export default TeamMemberPanel
