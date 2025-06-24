const express=require("express")
const {saveTeamMessage,getTeamMessages,uploadImage}=require("../controllers/teamMessageController")

const requireAuth=require("../middlewares/authMiddleware")
const upload=require("../config/multer")
const router=express.Router()

const handleMulterErrors = (err, req, res, next) => {
  if (err) {
    console.error("multer error:", err);
    return res.status(400).json({ success: false, message: "File upload failed", error: err.message });
  }
  next();
};

router.get("/:teamId",requireAuth,getTeamMessages)
router.post("/",requireAuth,saveTeamMessage)
router.post("/upload-image",upload.single("image"),uploadImage)
router.post("/test-upload", upload.single("image"),handleMulterErrors, (req, res) => {
  try {
    console.log("testupload route hit");
    console.log("req.file =", req.file);
    res.json({ success: true, file: req.file });
  } catch (err) {
    console.error("upload error:", err);
    res.status(500).json({ error: "something went wrong" });
  }
});

module.exports=router