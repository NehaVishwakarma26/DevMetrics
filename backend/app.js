const express=require("express")
const cookieParser=require("cookie-parser")
const userRoutes = require("./routes/userRoutes");
const goalsRoutes=require("./routes/goalsRoutes")

const analyticsRoutes=require("./routes/analyticsRoutes")
const githubRoutes=require("./routes/githubRoutes");

const githubDataRoutes = require("./routes/githubDataRoutes");
const apiLimiter=require("./middlewares/rateLimit")
const cors=require("cors")
const connectDB=require("./config/db")
connectDB()
const app=express()

app.use(cors({
    origin:["https://dev-metrics-five.vercel.app"],
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

module.exports=app