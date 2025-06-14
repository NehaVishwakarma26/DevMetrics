const mongoose=require("mongoose")

const goalSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    dailyCommitGoal:Number,
    weeklyPRGoal:Number,
    completed: {
  type: Boolean,
  default: false
},
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Goal", goalSchema);