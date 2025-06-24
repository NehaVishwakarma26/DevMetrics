const TeamMemberCard = ({ member, isAdmin, isSelf }) => {
    console.log(member)
  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-md flex items-center gap-4 mb-3">
     
       <img
            src={member?.avatar}
            alt="avatar"
            className="w-8 h-8 rounded-full border"
          />
      <div>
        <h4 className="text-md font-bold ">{member.username} {isSelf && <span className="text-teal-300">(You)</span>}</h4>
        <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block 
          ${isAdmin ? "bg-yellow-500 text-black" : "bg-gray-700"}`}>
          {isAdmin ? "Admin" : "Member"}
        </span>
      </div>
    </div>
  );
};

export default TeamMemberCard;
