const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId
const Schema = mongoose.Schema;
const userModel = require("./userModel");
const resultModel = require("./resultModel");
const moment = require("moment-timezone");
const { createTestAccount } = require("nodemailer");
const dateBD = moment.tz(Date.now(), "Asia/Dhaka");
// const guess = moment.tz.guess();
// console.log(dateBD)

const roomSchema = new mongoose.Schema({
  teacherName: { type: String },
  teacherId: { type: mongoose.Schema.Types.ObjectId },
  courseName: { type: String },
  negMarks: { type: Boolean },
  totalParticipants: { type: Number },
  sumMarks: { type: Number },
  maxMarks: { type: Number },
  minMarks: { type: Number },
  easyType: { type: Number },
  mediumType: { type: Number },
  hardType: { type: Number },
  easyMarks:{type:Number},
  mediumMarks:{type:Number},
  hardMarks:{type:Number},
  category : {type:Boolean},
  questions: [
    {
      question: String,
      marks: Number,
      correct_answer: String,
      options: [],
      question_type: String,
      q_id: String,
      category: String,
    },
  ],
  student: { type: [] },
  totalStudent: { type: Number },
  startTime: { type: Date, default: dateBD },
  endTime: { type: Date, default: dateBD },
  createdAt: { type: Date, default: dateBD },
  totalMarks: { type: Number },
  totalMarksOfExam: { type: Number }
});

roomSchema.statics.createRoom = async function (userDoc, room) {
  // console.log("userDoc", userDoc);
  // console.log("room", room);

  let modifiedStartTime = new Date(room.startTime);
  let modifiedEndTime = new Date(room.endTime);
  let modifiedCreatedAt = new Date(room.createdAt);
  modifiedStartTime.setHours(modifiedStartTime.getHours() - 6);
  modifiedEndTime.setHours(modifiedEndTime.getHours() - 6);
  modifiedCreatedAt.setHours(modifiedCreatedAt.getHours());

  // return true

  const newRoom = await this.create({
    teacherId: userDoc._id,
    teacherName: userDoc.username,
    courseName: room.courseName,
    questions: room.questions,
    negMarks: room.negMarks,
    startTime: modifiedStartTime,
    endTime: modifiedEndTime,
    createdAt: modifiedCreatedAt,
    totalMarks: room.totalMarks,
    totalMarksOfExam: room.totalMarksOfExam,
    category:room.category,
    totalParticipants: 0,
    sumMarks: 0,
    maxMarks: 0,
    minMarks: 0,
    totalStudent: 0,
    easyType: room.easyType,
    mediumType: room.mediumType,
    hardType: room.hardType,
    easyMarks:room.easyMarks,
    mediumMarks:room.mediumMarks,
    hardMarks:room.hardMarks
  });

  const result = await userModel.updateOne(
    { _id: userDoc._id },
    {
      $push: {
        myRooms: {
          roomID: newRoom._id,
          teacherName: userDoc.username,
          startTime: room.startTime,
          endTime: room.endTime,
          CourseName: room.courseName,
          CreatedAt: room.createdAt,
          participated: false,
          totalMarks: room.totalMarks,
          gotMarks: 0,
        },
      },
      $inc: { totalRooms: 1 },
    }
  ); //increment totalrooms by 1
  return [result.acknowledged, newRoom._id.toString()];
};

roomSchema.statics.myRoom = async function (id) {
  const roomData = await userModel.find({ _id: id }, { myRooms: 1 });
  return roomData;
};

roomSchema.statics.roomInfo = async function (roomID) {
  if (mongoose.Types.ObjectId.isValid(roomID)) {
    // const room = await this.findOne({_id:roomID});
    const room = await this.findOne({ _id: mongoose.Types.ObjectId(roomID) });
    return room;
  } else throw Error("Room Doesn't exists!!!");
};

roomSchema.statics.addToMyRoom = async function (userID, room, resultID) 
{
  //updating myrooms array for user
  const updateMyRooms = await userModel.updateOne(
    { _id: userID },
    {
      $push: {
        myRooms: {
          roomID: room._id,
          resultID: ObjectId(resultID),
          teacherName: room.teacherName,
          startTime: room.startTime,
          endTime: room.endTime,
          courseName: room.courseName,
          createdAt: room.createdAt,
          participated: false,
          totalMarks: room.totalMarks,
          gotMarks: 0
        },
      },
      $inc: { totalRooms: 1 }, //increment totalrooms by 1
    }
  );
  return updateMyRooms.acknowledged;
  
};
roomSchema.statics.insertAsStudent = async function (user, room, roomID,resultID) {
  const updateStudents = await this.updateOne(
    { _id: roomID },
    {
      $push: {
        student: {
          studentName: user.username,
          studentID: user._id,
          resultID:ObjectId(resultID),
          participated: false,
          totalMarks: room.totalMarks,
          gotMarks: 0,
        },
      },
      $inc: { totalStudent: 1 },
    }
  );
  // console.log(updateStudents)
  return updateStudents.acknowledged;
};
// roomSchema.statics.calculateResult = async function (userID, roomID, neg, ans) {
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
//   return result;
// };
roomSchema.statics.updateResult = async function (
  userID,
  roomID,
  result,
  room,
  ans,
  resultDoc
) {
  console.log("userID", userID, "roomID", roomID);

  let gotMarks = resultDoc.gotMarks + result;
  let maxMarks = Math.max(gotMarks, room.maxMarks);
  let minMarks = Math.max(0,Math.min(gotMarks, room.minMarks))

  //posting in result collection
  const postResult = await resultModel.updateResult(userID,roomID,ans,gotMarks,maxMarks,minMarks);

  //in user collection's myRoom array
  const updateUserCollection = await userModel.updateOne(
    {
      _id: userID,
      "myRooms.roomID": mongoose.Types.ObjectId(roomID),
    },
    {
      $set: {
        "myRooms.$.gotMarks": gotMarks,
        "myRooms.$.participated": true
      }
    }
  );

  //in room collection's student array
  const updateRoomCollection = await this.updateOne(
    {
      _id: roomID,
      "student.studentID": mongoose.Types.ObjectId(userID),
    },
    {
      $set: {
        "student.$.gotMarks": gotMarks,
        "student.$.participated": true,
        maxMarks:maxMarks,
        minMarks:minMarks
      },
      $inc: { totalParticipants: 1 },
    }
  );

  if (updateUserCollection.acknowledged && updateRoomCollection.acknowledged) {
    return true;
  }
  return false;
};

roomSchema.statics.examdata = async function (userID) {
  const currTime = new Date(Date.now());
  const data = await this.find({
    teacherId: mongoose.Types.ObjectId(userID),
    endTime: { $lte: currTime },
  })
    .sort({ endTime: 1 })
  return data;
};

module.exports = mongoose.model("Room", roomSchema);
