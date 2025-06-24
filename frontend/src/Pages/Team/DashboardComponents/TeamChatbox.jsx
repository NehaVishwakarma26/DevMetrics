import React, { useState, useEffect ,useRef} from "react";
import socket from "../../../socket"
import {getTeamMessages,saveTeamMessage,handleImageUpload as handleImageUploadAPI,testUpload} from "../../../services/api"
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ImageUp } from 'lucide-react';

const TeamChatPage = () => {
    const {user}=useAuth()
    const {teamId}=useParams()
  const [messages,setMessages]=useState([])
  const chatRef=useRef(null)
  const [message, setMessage] = useState("");

useEffect(()=>{
    chatRef.current?.scrollIntoView({behavior:"smooth"})

},[messages])

 useEffect(()=>{
    const fetchChats=async ()=>{
try{
    const res=await getTeamMessages(teamId)
setMessages(res.data.messages);
console.log("fetched msg",res.data.messages)
socket.emit("join-room",teamId)

}
catch(Err)
{
    console.log("failed to fetch msgs",Err)
}


    }

    if(teamId)
{
    fetchChats()
}

return ()=>{
    socket.off("receive-message")
    
}
 },[teamId])

 useEffect(()=>{
    socket.on("receive-message",(data)=>{
        setMessages((prev)=>[...prev,data]);
    })

    return()=>{
        socket.off("receive-message")
    }
 },[])

const handleSend=async()=>{
    if(!message.trim())
        return;

    const msgData={
        roomId:teamId,
        senderId:user._id,
        senderName:user.username,
        message:message.trim(),
        timestamp: new Date().toISOString() 
    }

socket.emit("send-message",msgData)
console.log("message sent")

setMessage("")

}

const handleImageUpload=async(e)=>{
    const file=e.target.files[0];

if(!file)return;

const formData=new FormData();
formData.append("image",file)

try{
    const res=await handleImageUploadAPI(formData);
    const imageUrl=res.data.imageUrl;

   const msgData = {
      roomId: teamId,
      senderId: user._id,
      senderName: user.username,
      message: "", // No text
      image: imageUrl,
      timestamp: new Date().toISOString()
    };

    socket.emit("send-message",msgData);
    console.log("Image sent")
}
catch(err)
{
    console.error("Image upload failed",err)
}
}

const handleTestUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await testUpload(formData);
    console.log("Upload success!", res.data);
  } catch (err) {
    console.error("Upload test failed", err);
  }
};


  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4 shadow flex items-center justify-between">
        <h2 className="text-xl font-semibold text-purple-300">Team Chat</h2>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-sm px-3 py-1 rounded"
          onClick={() => window.history.back()}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.map((msg, idx) => (
       <div
  key={idx}
  className={`max-w-md px-4 py-2 rounded-lg text-sm ${
    msg.senderId === user._id
      ? "bg-purple-600 ml-auto text-right"
      : "bg-zinc-700 mr-auto"
  }`}
>
  <p className="font-medium">{msg.senderName}</p> {/* ✅ Show sender */}
{msg.message && <p>{msg.message}</p>}
{msg.image && (
  <img
    src={msg.image}
    alt="shared-img"
    className="mt-2 rounded max-w-[250px] border border-purple-600"
  />
)}
  <p className="text-xs text-gray-300 mt-1">
    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </p> 
</div>

        ))}
      </div>
      

      {/* Input */}
      <div className="px-4 py-3 border-t border-zinc-800 flex gap-2 bg-zinc-900">
        <input
          className="flex-1 px-4 py-2 rounded text-white"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

<label className="cursor-pointer text-purple-400 hover:text-purple-300">
    <ImageUp/>
<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
</label>

        <button
          onClick={handleSend}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
      <div ref={chatRef}> </div>
    </div>
  );
};

export default TeamChatPage;
