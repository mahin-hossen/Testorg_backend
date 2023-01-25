const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId
const resultSchema = new mongoose.Schema({
    gotMarks:{type:Number},
    maxMarks:{type:Number},
    minMarks:{type:Number},
    totalMarks:{type:Number},
    studentSubmission:{type:[]},
    userID:{ type: mongoose.Schema.Types.ObjectId },
    roomID:{ type: mongoose.Schema.Types.ObjectId }
})
resultSchema.statics.createResultID = async function(userID,roomID,totalMarks)
{
    const resultID = await this.create({
        gotMarks:0,
        maxMarks:0,
        minMarks:0,
        totalMarks:totalMarks,
        studentSubmission:[],
        userID:ObjectId(userID),
        roomID:ObjectId(roomID)
    })
    console.log(resultID)
    return resultID
}
resultSchema.statics.updateResult = async function(userID,roomID,ans,sumMarks,maxMarks,minMarks) 
{    
    const response = await this.updateOne({
        userID:ObjectId(userID),
        roomID:ObjectId(roomID)
    },
    {
        $push:{
            studentSubmission:ans            
        },
        $set: {
            "gotMarks": sumMarks,
            "maxMarks": maxMarks,
            "minMarks": minMarks
        }
    })
    // console.log("response res model",response)
    return response;
}
// resultSchema.statics.getResult = async function(resultID)
// {
//     // const result = await 
// }

module.exports = mongoose.model("Result",resultSchema);
