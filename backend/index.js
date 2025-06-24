require("dotenv").config()
const app=require("./app")

const http=require("http")

const {Server} =require("socket.io")
const setUpChatSocket=require("./socket/chatSocket")

const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:["http://localhost:5173","https://dev-metrics-five.vercel.app"],
        credentials:true
    }
})

setUpChatSocket(io)

const port=process.env.PORT || 5000
server.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})