const { Router } = require("express");
const router = Router();

//middleware
const {requireAuth} = require("../middlewares/authJWT")

//controllers
const { addRoomController, roomListController, viewRoomController, roomJoinController, submitResultController, getResultController, submitAnsController,roomInfoController} = require("../controllers/roomController");

router.post("/add-room",requireAuth, addRoomController);
router.post("/my-room",requireAuth, roomListController);
router.post("/view-room",requireAuth, viewRoomController);
router.post("/join-room",requireAuth,roomJoinController);
router.post("/submit-result",requireAuth,submitResultController);
router.post("/submit-ans",requireAuth,submitAnsController);
router.post("/roominfo",roomInfoController);

// router.post("/get-result",requireAuth,getResultController);

module.exports = router;
