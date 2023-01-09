const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")

const addRoomController = async (req,res) => {
    userModel.findById(res.locals.userID, async function(err,userDoc){
        console.log(userDoc)
        const response = await roomModel.createRoom(userDoc,req.body)
        if(response[0])
            res.status(201).json({roomCode:response[1]})
        else
            res.status(400).json({error : "Question Creation failed"})
    })    
}
const roomListController = async (req,res) =>{
    const response = await roomModel.myRoom(res.locals.userID);
    res.status(200).json(response)
}

const viewRoomController = async (req,res) =>{
    roomModel.findById(req.body.roomID, async function(err,userDoc){
        if(err)
        {
            res.status(400).json({error : "Room Doesnt exist"})
        }
        else{
            console.log(userDoc.questions)
            res.status(200).json(userDoc);
        }
    })    
}

const roomJoinController = async (req,res) =>{
    const roomID = req.body.roomCode;
    const userID = res.locals.userID;

    //getting roomInfo
    const room = await roomModel.roomInfo(req.body.roomCode);
    //getting userInfo
    const user = await userModel.userInfo(res.locals.userID);  

    if(!room)   res.json({error:"Room Doesn't exists!!!"})
    else
    {
        //updating users myroom
        const updateMyRooms = await roomModel.addToMyRoom(userID,room,roomID);

        //inserting as student in roomModel
        const asStudent = await roomModel.insertAsStudent(user,room,roomID);

        if(updateMyRooms && asStudent) res.status(301).json({msg:"You have Successfully joined!!!"})        
    }
}

module.exports = {addRoomController, roomListController, viewRoomController, roomJoinController}