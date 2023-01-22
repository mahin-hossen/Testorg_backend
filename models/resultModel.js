const mongoose = require("mongoose");
const resultSchema = new mongoose.Schema({
    gotMarks:{type:Number},
    studentSubmission:{type:[]},
    maxMarks:{type:Number},
    minMarks:{type:Number}
})
resultSchema.statics.postResult = async function(result,ans,room) 
{    
    const response = await this.create({
        gotMarks : result,
        studentSubmission : ans,
        maxMarks: Math.max(result,room.maxMarks),
        minMarks: Math.min(result,room.minMarks)
    })
    console.log(response._id)
    return response;
}
resultSchema.statics.getResult = async function(resultID)
{
    const result = await 
}

module.exports = mongoose.model("Result",resultSchema);
