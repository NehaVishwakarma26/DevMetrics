const mongoose=require("mongoose")

const statSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    date:Date,
    contributions:Number,
    commits:Number,
    pullRequests:Number,
    issues:Number,
},{timestamps:true})

module.exports=mongoose.model("GitHubStat",statSchema)