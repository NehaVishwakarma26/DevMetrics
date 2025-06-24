require("dotenv").config()

const { v2: cloudinary } = require("cloudinary");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ✅ Debug print
console.log("🌥️ Cloudinary configured with:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Present" : "❌ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Present" : "❌ Missing",
});

module.exports = cloudinary;
