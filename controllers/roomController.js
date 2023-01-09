const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")
const ObjectId = require("mongoose").Types.ObjectId

const addRoomController = async (req,res) => {
    try
    {
        userModel.findById(res.locals.userID, async function(err,userDoc){
            console.log(userDoc)
            const response = await roomModel.createRoom(userDoc,req.body)
            if(response[0])
                res.status(201).json({roomCode:response[1]})
            else
                res.status(400).json({error : "Question Creation failed"})
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
                    res.status(400).json({error : "Room Doesnt exist!!!"})
                }
                else{
                    console.log(userDoc.questions)
                    res.status(200).json(userDoc);
                }
            })
        }
        else res.status(400).json({error : "Room Doesnt exist!!!"})
         
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
   
}

const roomJoinController = async (req,res) =>{
    try{
        const roomID = req.body.roomCode;
        const userID = res.locals.userID;

        //getting roomInfo
        const room = await roomModel.roomInfo(req.body.roomCode);
        //getting userInfo
        const user = await userModel.userInfo(res.locals.userID);  

        if(!room)   res.status(400).json({error:"Room Doesn't exists!!!"})
        else
        {
            //updating users myroom
            const updateMyRooms = await roomModel.addToMyRoom(userID,room,roomID);

            //inserting as student in roomModel
            const asStudent = await roomModel.insertAsStudent(user,room,roomID);

            if(updateMyRooms && asStudent) res.status(301).json({msg:"You have Successfully joined!!!"})        
        }
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
    
}

module.exports = {addRoomController, roomListController, viewRoomController, roomJoinController}