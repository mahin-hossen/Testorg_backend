const { Router } = require("express");
const router = Router();

//middleware
const {requireAuth} = require("../middlewares/authJWT")

//controller functions
// const {
//   signupUser,
//   loginUser,
//   logoutUser,
//   verifyUser,
//   resendMail,
// } = require("../controllers/userController");
const {examdata} = require("../controllers/dashboardController")
//signup
router.post("/examdata",requireAuth,examdata);


module.exports = router;
