const { Router } = require("express");
const router = Router();

//middleware
const {requireAuth} = require("../middlewares/authJWT")

//controller functions
const{
    examdata
} = require("../controllers/dashboardController")
const {examdataController,reportController} = require("../controllers/dashboardController")

router.post("/examdata",requireAuth,examdataController);
router.post("/report",requireAuth,reportController);


module.exports = router;
