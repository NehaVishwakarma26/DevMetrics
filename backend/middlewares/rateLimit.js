//rate limiting middleware
//limits how many requests a client based on IP or user can make in a given time frame preventing abuse or accidental overhead

//npm install express-rate-limit

const rateLimit=require("express-rate-limit")

const apiLimiter=rateLimit({
    windowMs:15*60*1000,//15 minutes
    max:500,//limit each ip to 100 requests per windowMs
    message:{
        message:"Too many requests from this Ip, please try again later"
    },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers

})

module.exports=apiLimiter