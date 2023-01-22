const roomModel = require("../models/roomModel")

const examdataController = async(req,res)=>{
    try{
        const userID = res.locals.userID
        const data = await roomModel.examdata(userID);
        let result = []
        data.forEach(elem => {
            let response = singleRoomData(elem);
            result.push(response)
        });
        res.status(200).json(result)
    }catch(error){
        res.status(400).json({ error: error.message });
    }
}

const reportController = async(req,res)=>{
    try{        
        const roomID = req.body.roomID;
        const result = await roomModel.roomInfo(roomID);
        let response = {
            "teacherName" : result.teacherName,
            "courseName" : result.courseName,
            "students" : result.student
        }
        res.status(200).json(response)
    }catch(error){
        res.status(400).json({ error: error.message });
    }
}
function singleRoomData(data)
{
    console.log("elem",data)
    let obj = {
        "teacherName" : data.teacherName,
        "courseName" : data.courseName,
        "roomCode" : data._id,
        "negMarks" : data.negMarks,
        "maxMarks" : data.maxMarks,
        "minMarks" : data.minMarks,
        "totalStudent" : data.totalStudent,
        "totalParticipants" : data.totalParticipants,
        "meanMarks" : data.maxMarks/data.totalParticipants,
        "students" : data.student,
        "startTime":data.startTime,
        "endTime":data.endTime,
        "createdAt":data.createdAt
        /*
        //examdata
        totalStudents:
        roomCode:   
        badd [startTime:
        //student
        name,email]
        */    
          
    }
    return obj
}

module.exports = {examdataController,reportController}