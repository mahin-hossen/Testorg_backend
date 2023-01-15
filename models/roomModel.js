const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userModel = require("./userModel")

const roomSchema = new mongoose.Schema({
    teacherName:{type:String},
    teacherId:{type: mongoose.Schema.Types.ObjectId},
    courseName:{type: String},
    negMarks:{type:Boolean},
    questions:[{
        question:String,
        marks:Number,
        correct_answer:String,
        options:[],
        question_type:String,
        q_id:Number    
    }],
    student:{type:[]},
    startTime : {type: Date},
    endTime : {type: Date},
    createdAt : {type: Date},
    totalMarks : {type: Number}
})

roomSchema.statics.createRoom = async function (userDoc,room){
    console.log("userDoc", userDoc)
    console.log("room",room)
    const newRoom = await this.create({ 
        teacherId : userDoc._id,
        teacherName : userDoc.username,
        courseName : room.courseName,
        questions : room.questions,
        negMarks : room.negMarks,
        startTime : room.startTime,
        endTime : room.endTime,
        createdAt : room.createdAt,
        totalMarks : room.totalMarks   
    })
    const result = await userModel.updateOne({_id:userDoc._id},{$push : {
        myRooms:
        {
            "roomID" :newRoom._id,
            "teacherName" : userDoc.username,
            "startTime" : room.startTime,
            "endTime" : room.endTime,
            "CourseName" : room.courseName,
            "CreatedAt" : room.createdAt,
            "participated" : false,
            "totalMarks":room.totalMarks,
            "gotMarks":0
        },
        
    },$inc:{totalRooms:1}})//increment totalrooms by 1
    return [result.acknowledged,newRoom._id.toString()]
}

roomSchema.statics.myRoom = async function(id){
    const roomData = await userModel.find({_id:id},{myRooms:1})
    return roomData;
}

roomSchema.statics.roomInfo = async function(roomID)
{
    if(mongoose.Types.ObjectId.isValid(roomID))
    {
        // const room = await this.findOne({_id:roomID});
        const room = await this.findOne({_id:mongoose.Types.ObjectId(roomID)});
        return room;
    }
    else throw Error("Room Doesn't exists!!!")

}

roomSchema.statics.addToMyRoom = async function(userID,room,roomID)
{
    //If already joined
    const roomExist = await userModel.findOne({_id:userID}).elemMatch("myRooms",{"roomID":mongoose.Types.ObjectId(roomID)})   
    // console.log("roomExist",roomExist)

    if(roomExist) throw Error("You have already joined this room");//change
    else
    {
        //updating myrooms array for user
        const updateMyRooms = await userModel.updateOne({_id:userID},{$push : {
            myRooms:
            {
                "roomID" :room._id,
                "teacherName" : room.teacherName,
                "startTime" : room.startTime,
                "endTime" : room.endTime,
                "CourseName" : room.courseName,
                "CreatedAt" : room.createdAt,
                "participated" : false,
                "totalMarks":room.totalMarks,
                "gotMarks":0
            }
            
        },$inc:{totalRooms:1}//increment totalrooms by 1
    })
        return updateMyRooms.acknowledged;
    }    
}
roomSchema.statics.insertAsStudent = async function(user,room,roomID)
{  
    const updateStudents = await this.updateOne({_id:roomID},{$push : {
        student:
        {
            "studentName" : user.username,
            "studentID" : user._id,
            "participated" : false,
            "totalMarks":room.totalMarks,
            "gotMarks":0
        }        
    }})
    return updateStudents.acknowledged;

}
roomSchema.statics.calculateResult = async function(userID,roomID,neg,ans)
{
    let negMarks = 0;
    let marks = 0;
    let result = 0;
    ans.forEach(qid => {
        if(qid.correct_answer===qid.student_answer)
        {
            marks+=Number(qid.marks)
        }
        else negMarks+=Number(qid.marks)
    });
    if(neg)
    {
        result = Math.max(0,marks-negMarks)        
    }
    else result = marks;
    return result;
}
roomSchema.statics.updateResult = async function(userID,roomID,result)
{
    //in room collection's student array
    console.log("userID",userID,"roomID",roomID)

    const updateUserCollection = await userModel.updateOne({
        _id:userID,
        "myRooms.roomID":mongoose.Types.ObjectId(roomID)
        },
        {
            $set:{"myRooms.$.gotMarks" : result}
        }
    )

    const updateRoomCollection = await this.updateOne({
        _id:roomID,
        "student.studentID":mongoose.Types.ObjectId(userID)
        },
        {
            $set:{"student.$.gotMarks" : result}
        }
    )


    if(updateUserCollection.acknowledged && updateRoomCollection.acknowledged)
    {
        return true;
    }
    return false;

}
module.exports = mongoose.model("Room",roomSchema);