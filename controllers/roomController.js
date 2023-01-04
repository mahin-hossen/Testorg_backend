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
const roomPost = async (req,res) => {
    userModel.findById(res.locals.userID, async function(err,userDoc){
        if(err)//doesnt exists;
        {
            res.status(400).json({msg : "Unauthorized access"})////unauthorized access
        }
        else{            
            const response = await roomModel.createRoom(userDoc,req.body)
            if(response[0])
                res.status(201).json({roomCode:response[1]})
            else
                res.status(500).json({err : "Question Creation failed"})
        }
    })
    
}
const roomList = async (req,res) =>{
    const response = await roomModel.myRoom(res.locals.userID);
    res.status(200).json(response)
}

const viewRoom = async (req,res) =>{
    roomModel.findById(req.body.roomID, async function(err,userDoc){
        if(err)
        {
            res.status(400).json({msg : "Room Doesnt exist"})
        }
        else{
            console.log(userDoc)
            res.status(200).json(userDoc);
        }
    })    
}

module.exports = {roomPost, roomList, viewRoom}