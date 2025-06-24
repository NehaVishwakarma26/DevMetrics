const TeamMessage=require("../models/TeamMessage")
const upload=require("../config/multer")
const getTeamMessages=async (req,res)=>{
    try{
        const {teamId}=req.params;
        const messages=await TeamMessage.find({roomId:teamId}).sort({timestamp:1})
res.status(200).json({messages})

    
}
catch(err)
{
    res.status(500).json({error:"Failed to fetch messages"})
}
}

const saveTeamMessage=async (req,res)=>{
    try{
        const {senderId,roomId,message}=req.body;
        const senderName=req.user.username;
        const newMessage=new TeamMessage({senderId,senderName,roomId,message})
        await newMessage.save()

        res.status(201).json({message:"Message saved"})

    }
    catch(err)
    {
        res.status(500).json({error:"failed to save message"})
    }
}

const uploadImage = async (req, res) => {
  try {
        console.log("req.file:",req.file)

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    console.log("req.file:",req.file)

    res.status(200).json({
      success: true,
      imageUrl: req.file.path, 
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ success: false, message: "Server error while uploading image" });
  }
};


module.exports={saveTeamMessage,getTeamMessages,uploadImage}