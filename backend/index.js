const dotenv = require("dotenv");

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.development" });
}

const app=require("./app")


const port=process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})