const multer=require("multer")
const {CloudinaryStorage}=require("multer-storage-cloudinary")
const cloudinary=require("./cloudinary")

const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params: {
    folder: "chat-images",
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
}

})

const upload = multer({ storage });

module.exports=upload