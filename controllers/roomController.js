const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")
const ObjectId = require("mongoose").Types.ObjectId
const moment = require("moment-timezone");
const resultModel = require("../models/resultModel");

const addRoomController = async (req,res) => {
    try
    {
        userModel.findById(res.locals.userID, async function(err,userDoc){
            // console.log(userDoc)
            // console.log(req.body)
            let room = req.body
            // console.log("room",room)
            if(room.category)
            {                
              room.totalMarks = room.easyType*room.easyMarks+room.hardType*room.hardMarks+room.mediumType*room.mediumMarks
              
              //inserting marks to array
              room.questions = insertMarks(room.questions,room.easyMarks,room.mediumMarks,room.hardMarks)
            }       
            // console.log("room",room)
            // return false 
            const response = await roomModel.createRoom(userDoc,room)
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
            // console.log(req.body.roomID)
            roomModel.findById(req.body.roomID, async function(err,roomDoc){
                if(err)
                {
                    throw Error("Room Doesnt exist!!!")
                }
                else{
                    if(!roomDoc) throw Error("Room Doesnt exist!!!")

                    if(roomDoc.category)
                    {
                        const question = generateQuestion(roomDoc.easyType,roomDoc.mediumType,roomDoc.hardType,roomDoc.questions)
                        roomDoc.questions = question
                    }
                    res.status(200).json(roomDoc);
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
            //If already joined
            const roomExist = await userModel
            .findOne({ _id: userID })
            .elemMatch("myRooms", { roomID: mongoose.Types.ObjectId(roomID) });
            if (roomExist) throw Error("You have already joined this room");

            //creating resultID            
            const resultID = await resultModel.createResultID(userID,roomID,room.totalMarks)

            //updating users myroom 
            const updateMyRooms = await roomModel.addToMyRoom(userID,room,resultID);

            //inserting as student in roomModel
            const asStudent = await roomModel.insertAsStudent(user,room,roomID,resultID);            

            if(updateMyRooms && asStudent) res.status(201).json({msg:"You have Successfully joined!!!"})        
        }
    }catch(error)
    {
        res.status(400).json({ error: error.message });
    }
    
}
const roomInfoController = async(req,res) =>
{
    try
    {
        const room = await roomModel.roomInfo(req.body.roomID);
        res.status(200).json(room);

    }catch(error){
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

        const result = calculateResult(negMarks,ans)
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
// const getResultController = async(req,res) =>{
//     try{
//         const userID = res.locals.userID
//         const roomID = req.body.roomID
    
//         const resultID = await userModel.getResultID(userID,roomID)
//         const result = await resultModel.getResult(resultID)
//         console.log("resultID",resultID)
//     }catch(error)
//     {
//         res.status(400).json({ error: error.message });
//     }

// }
const submitAnsController = async(req,res)=>
{
    try{
        const userID = res.locals.userID
        const roomID = req.body.roomID
        const negMarks = req.body.negMarks
        const ans = req.body.studentAnswer
        let response = await roomModel.findOne({_id:roomID,"student.studentID":ObjectId(userID)},{"student.$":1})
        const resultID = response.student[0].resultID;

        const room = await roomModel.roomInfo(roomID);
        const resultDoc = await resultModel.findOne({_id:resultID})
        // console.log("resultDoc",resultDoc)

        const marks = calculateResult(negMarks,ans)
        const confirmation = await roomModel.updateResult(userID,roomID,marks,room,ans,resultDoc)
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
const studentResultController = async(req,res)=>
{
    try{
        const roomID = req.body.roomID
        const userID = res.locals.userID
        let result = await resultModel.findOne({roomID:ObjectId(roomID),userID:ObjectId(userID)})
        
        res.json({
            gotMarks:result.gotMarks,
            maxMarks:result.maxMarks,
            minMarks:result.minMarks,
            totalMarks:result.totalMarks,
            roomID:result.roomID,
            questions:result.studentSubmission
        });
    }catch(error){
        res.status(400).json({error:error.message})
    }

}
function calculateResult(neg, ans) {
    if(ans.correct_answer==ans.student_answer)  return ans.marks
    if(neg) return (0-ans.marks) //if neg On
    return 0
    //   let negMarks = 0;
    //   let marks = 0;
    //   let result = 0;
    //   ans.forEach((qid) => {
    //     if (qid.correct_answer === qid.student_answer) {
    //       marks += Number(qid.marks);
    //     } else negMarks += Number(qid.marks);
    //   });
    //   if (neg) {
    //     result = Math.max(0, marks - negMarks);
    //   } else result = marks;
    //   console.log(result)
    //   return result;
};
function generateQuestion(easy,medium,hard,arr)
{
    //spliting category
    let hardQ = [], easyQ = [], mediumQ =[]
    let finalQ = []
    arr.forEach(element => {
        if(element.category==="hard")   hardQ.push(element)
        if(element.category==="medium")    mediumQ.push(element)
        if(element.category==="easy")    easyQ.push(element)
    });

    //random questions

    //hard
    while(hard--)
    {
        let num = getRandom(hardQ.length-1)        
        finalQ.push(hardQ[num])
        hardQ.splice(num,1)
    }
    //medium
    while(medium--)
    {
        let num = getRandom(mediumQ.length-1)        
        finalQ.push(mediumQ[num])
        mediumQ.splice(num,1)
    }
    //easy
    while(easy--)
    {
        let num = getRandom(easyQ.length-1)        
        finalQ.push(easyQ[num])
        easyQ.splice(num,1)
    }
    return finalQ
}
function getRandom(limit)
{
    let number = Math.floor(Math.random() *limit )
    return number
}
function insertMarks(room,easy,medium,hard)
{
    room.forEach(element =>{
        if(element.category==="easy")   element.marks = easy
        if(element.category==="medium") element.marks = medium
        if(element.category==="hard")   element.marks = hard
    })
    return room
}
module.exports = {addRoomController, roomListController, viewRoomController, roomJoinController, submitResultController, roomInfoController,submitAnsController,studentResultController}