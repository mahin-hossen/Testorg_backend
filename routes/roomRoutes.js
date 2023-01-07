const { Router } = require("express");
const router = Router();

//middleware
const {requireAuth} = require("../middlewares/authJWT")

//controllers
const { addRoomController, roomListController, viewRoomController, roomJoinController} = require("../controllers/roomController");

router.post("/add-room",requireAuth, addRoomController);
router.post("/my-room",requireAuth, roomListController);
router.post("/view-room",requireAuth, viewRoomController);
router.post("/join-room",requireAuth,roomJoinController);

module.exports = router;
