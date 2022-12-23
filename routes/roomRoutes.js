const { Router } = require("express");
const router = Router();

//middleware
const {requireAuth} = require("../middlewares/authJWT")

//controllers
const { roomPost, roomList, viewRoom} = require("../controllers/roomController");

router.post("/add-room",requireAuth, roomPost);
router.get("/my-room",requireAuth, roomList);///done
router.get("/view-room",requireAuth, viewRoom)

module.exports = router;
