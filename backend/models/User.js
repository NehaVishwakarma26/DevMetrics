const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    githubId:{
        type:String,
        required:true,
        unique:true
    },
    username:String,
    avatar:String,
    accessToken:String,//github OAuth token (store securely)
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    accessToken:{
        type:String,
        required:false
    },
    lastGithubSync:{
        type:Date,
        default:null
    }
},{timestamps:true})

module.exports = mongoose.model("User", userSchema);