const mongoose=require("mongoose")

const teamMessageSchema=new mongoose.Schema({
    roomId:String,
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    message:String,
    senderName:String,
    timestamp:{
        type:Date,
        default:Date.now
    },
    image:{
        type:String,
    }
})

module.exports=mongoose.model("TeamMessage",teamMessageSchema)