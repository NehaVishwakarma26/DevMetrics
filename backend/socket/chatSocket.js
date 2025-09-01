const TeamMessage=require("../models/TeamMessage")

const setUpChatSocket=(io)=>{
    io.on("connection",(socket)=>{
        console.log("User connected",socket.id)

socket.on("join-room",(roomId)=>{
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`)
})

socket.on("send-message",async (msgData)=>{

const {roomId,message,senderId,senderName,image}=msgData;

try{
    const savedMsg=await TeamMessage.create({
        roomId,
        senderId,
        senderName,
        message:message||null,
        image:image||null
    })

    console.log("message ssaved in db:",savedMsg)
    io.to(roomId).emit("receive-message",savedMsg)
}
catch(err)
{
    console.error("Error saving message",err);
}

})

socket.on("disconnect",()=>{
    console.log("user disconnected",socket.id)
})

    })


}

module.exports=setUpChatSocket