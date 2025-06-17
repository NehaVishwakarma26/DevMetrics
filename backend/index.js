const dotenv = require("dotenv");

// Load correct env file before anything else
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
});

const connectDB = require("./config/db");
connectDB(); // connect to MongoDB

const app= require("./app");

const port= process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});
