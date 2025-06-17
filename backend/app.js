const express=require("express")
const cookieParser=require("cookie-parser")
const userRoutes = require("./routes/userRoutes");
const goalsRoutes=require("./routes/goalsRoutes")

const analyticsRoutes=require("./routes/analyticsRoutes")
const githubRoutes=require("./routes/githubRoutes");

const githubDataRoutes = require("./routes/githubDataRoutes");
const teamRoutes=require("./routes/teamRoutes")
const apiLimiter=require("./middlewares/rateLimit")
const cors=require("cors")

const app=express()
// trust proxy is used to trust the proxy server
app.set('trust proxy', 1); 
app.use(cors({
    origin:["https://dev-metrics-five.vercel.app","http://localhost:5173"],
    credentials:true
}));
app.use(cookieParser());

app.use(express.json())

//Limit requests from the same IP to 100 every 15 minutes.
//Respond with an error message when the limit is exceeded.
app.use("/api/", apiLimiter);

app.use("/api/users",userRoutes)
// app.use("/api/goals",goalsRoutes)
app.use("/api/github",githubRoutes)
app.use("/api/githubData", githubDataRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/team",teamRoutes)
module.exports=app