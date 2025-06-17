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
    }
},{timestamps:true})

module.exports = mongoose.model("User", userSchema);