// const roomWorking = async(req,res) =>{
//     console.log(req.path, req.method, req.cookies);
//     res.json({msg : "room working fine"});
// }
// const q_form = 
// [
//     {
//         "q_no": 1,
//         "q_type": "mcq",
//         "question": "how are you?",
//         "correct_answer": "fine",
//         "options": ["fine","good","bad"
//          ],
//         "marks": 3
//      },
//      {
//         "q_no": 2,
//         "q_type": "mcq",
//         "question": "how are you?",
//         "correct_answer": "fine",
//         "options": ["fine","good","bad"
//          ],
//         "marks": 3
//      },
//         {
//         "q_no": 3,
//         "q_type": "mcq",
//         "question": "how are you?",
//         "correct_answer": "fine",
//         "options": ["fine","good","bad"
//          ],
//         "marks": 3
//      }
// ]

const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")

// const userVerified = (token) =>{
//     jwt.verify(token,process.env.secret,async (err,decodedToken) =>{
//         if(err){
//             return id = "";//unauthorized access
//         }
//         else{
//             return id = decodedToken._id;
//         }
//     })
// }
const addRoomController = async (req,res) => {
    userModel.findById(res.locals.userID, async function(err,userDoc){
        console.log(userDoc)
        const response = await roomModel.createRoom(userDoc,req.body)
        if(response[0])
            res.status(201).json({roomCode:response[1]})
        else
            res.status(500).json({err : "Question Creation failed"})
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
            res.status(400).json({msg : "Room Doesnt exist"})
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

    //updating users myroom
    const room = await roomModel.roomInfo(req.body.roomCode);
    // console.log("room",room)
    const student = await userModel.findById(res.locals.userID)
    // console.log(student)
    //room er student er bitore
    //user er myroom
}

module.exports = {addRoomController, roomListController, viewRoomController, roomJoinController}