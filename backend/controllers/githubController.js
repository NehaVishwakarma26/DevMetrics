const axios = require("axios");
const User=require("../models/User")

const GithubStat=require("../models/GitHubStat")
const jwt=require("jsonwebtoken")

const {fetchAndSaveGithubStats} =require("./githubDataController")

//When this route is hit, user is redirected to GitHub to log in and authorize your app.
// GitHub redirects the user back to your app with a code in the query string.
const githubLogin=async (req,res)=>{
    const clientId=process.env.GITHUB_CLIENT_ID;
    const redirectUri="https://devmetrics-api.onrender.com/api/github/callback";
    // const redirectUri = "http://localhost:5000/api/github/callback";
    const githubAuthUrl=`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`
res.redirect(githubAuthUrl)

}


const githubCallback=async (req,res)=>{
  //  GitHub first gives you a temporary code.

//You exchange it (securely) for a real access token, using your secret.
    const code=req.query.code;
    if(!code)
        return res.status(400).json({message:"No code found in callback URL"})

    const tokenResponse=await axios.post(
        "https://github.com/login/oauth/access_token",{
            client_id:process.env.GITHUB_CLIENT_ID,
            client_secret:process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri:"https://devmetrics-api.onrender.com/api/github/callback"
            // redirect_uri:"http://localhost:5000/api/github/callback"
        },
        {
            headers:{
                Accept:"application/json"
            }
        }
    )
    const accessToken=tokenResponse.data.access_token
// Use access token to get user profile
    const userResponse = await axios.get("https://api.github.com/user", {
  headers: { Authorization: `Bearer ${accessToken}` }
});

const githubUser = userResponse.data;

let user=await User.findOne({githubId:githubUser.id})

if(!user)
{
    user=await User.create({
        username:githubUser.login,
        githubId:githubUser.id,
        avatar:githubUser.avatar_url,
        accessToken:accessToken
    })
}
else{
    user.accessToken=accessToken;
    await user.save()
}

    await fetchAndSaveGithubStats(user);


const token=jwt.sign({id:user._id,username:user.username},process.env.JWT_SECRET,{
    expiresIn:"1h"
})

res.cookie("token", token, { httpOnly: true,
  sameSite: "None",
  secure: true });
  console.log("Redirecting to LOCALHOST dashboard...");

res.redirect("https://dev-metrics-five.vercel.app/dashboard");


}
// res.redirect("http://localhost:5173/dashboard")




const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    path: "/",
  });
  res.status(200).json({ msg: "Logged out successfully" });
};

const syncGithubStats = async (req, res) => {
  try {
    const user = req.user;

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      await fetchAndSaveGithubStats(user, targetDate);
    }

    res.status(200).json({ success: true, message: "Last 7 days synced" });
  } catch (err) {
    console.error("Sync error:", err.message);
    res.status(500).json({ success: false, message: "Failed to sync stats." });
  }
};



module.exports={githubCallback,githubLogin,logout,syncGithubStats}