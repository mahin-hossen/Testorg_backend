const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")

const requireAuth = async (req, res, next) => {
  // const token = req.cookies.jwt;
  const token = req.body.token;
  if (token) {
    console.log("jere")
    jwt.verify(token, process.env.SECRET, async(err, decodedToken) => {
      if (err) {
        console.log("token not valid");
        res.status(400).json({ error: "You have to Login first" });
      } else {
        console.log("decodedToken", decodedToken);
        const user = await userModel.userExists(decodedToken._id)
        
        if(!Object.keys(user).length)
        {
          throw Error("User doesnt exists!!!")
        } 
        res.locals.userID = decodedToken._id;
        next();
      }
    });
  } else {
    console.log("no token");
    res.status(400).json({ error: "User Doesn't exist" });
  }
};

module.exports = { requireAuth };
