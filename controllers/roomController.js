const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")
const ObjectId = require("mongoose").Types.ObjectId
const moment = require("moment-timezone");

const addRoomController = async (req,res) => {
    try
    {
        userModel.findById(res.locals.userID, async function(err,userDoc){
            // console.log(userDoc)
            const response = await roomModel.createRoom(userDoc,req.body)
            if(response[0])
                res.status(201).json({roomCode:response[1]})
            else
                throw Error("Question Creation failed")
        })  
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
  
}
const roomListController = async (req,res) =>{
    try{
        const response = await roomModel.myRoom(res.locals.userID);
        res.status(200).json(response)
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
    
}

const viewRoomController = async (req,res) =>{
    try
    {
        if(ObjectId.isValid(req.body.roomID))
        {
            roomModel.findById(req.body.roomID, async function(err,userDoc){
                if(err)
                {
                    throw Error("Room Doesnt exist!!!")
                }
                else{
                    res.status(200).json(userDoc);
                }
            })
        }
        else throw Error("Room Doesnt exist!!!")
         
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
   
}

const roomJoinController = async (req,res) =>{
    try{
        const roomID = req.body.roomCode;
        const userID = res.locals.userID;
        console.log("roomID",roomID,"userID", userID)
        //getting roomInfo
        const room = await roomModel.roomInfo(req.body.roomCode);
        console.log("room",room)
        //getting userInfo
        const user = await userModel.userInfo(res.locals.userID);  
        
        if(userID===room.teacherId.toString())
        {   
            throw Error("You are already Teacher of this room")
        } 
        if(!room)   throw Error("Room Doesn't exists!!!")
        else
        {
            //updating users myroom
            const updateMyRooms = await roomModel.addToMyRoom(userID,room,roomID);

            //inserting as student in roomModel
            const asStudent = await roomModel.insertAsStudent(user,room,roomID);

            if(updateMyRooms && asStudent) res.status(201).json({msg:"You have Successfully joined!!!"})        
        }
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
    
}

const submitResultController = async(req,res) =>{
    try{
        const userID = res.locals.userID
        const roomID = req.body.roomID
        const negMarks = req.body.negMarks
        const ans = req.body.studentAnswer

        const room = await roomModel.roomInfo(roomID);

        const result = await roomModel.calculateResult(userID,roomID,negMarks,ans)
        const confirmation = await roomModel.updateResult(userID,roomID,result,room,ans)
        if(confirmation)
        {
            res.status(201).json({msg:"Result Submitted Successfully"})
        }
        else throw Error ("Some error Occured on our end")
    }catch(error)
    {
        res.status(400).json({error:error.message})
    }
}

const getResultController = async(req,res) =>{
    try{
        const userID = res.locals.userID
        const roomID = req.body.roomID
    
        const resultID = await userModel.getResultID(userID,roomID)
        console.log("resultID",resultID)
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }

}
module.exports = {addRoomController, roomListController, viewRoomController, roomJoinController, submitResultController, getResultController}