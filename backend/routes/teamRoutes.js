const require = require("express");
const { createTeam, getUserTeams} = require("../controllers/teamController.js")
const requireAuth =( "../middlewares/authMiddleware.js");

const router=express.Router();

router.post("/create",requireAuth,createTeam);
router.get("/my",requireAuth,getUserTeams)
module.exports = router;