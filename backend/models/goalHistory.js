const mongoose=require("mongoose")

const goalHistorySchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    dailyCommitGoal:Number,
    weeklyPRGoal:Number,
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model("GoalHistory",goalHistorySchema)
