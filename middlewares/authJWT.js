const jwt = require("jsonwebtoken");
// const userModel = require("../models/userModel")

const requireAuth = async (req, res, next) => {
  // const token = req.cookies.jwt;
  const token = req.body.token;
  if (token) {
    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err) {
        console.log("token not valid");
        res.status(400).json({ error: "You have to Login first" });
      } else {
        console.log("decodedToken", decodedToken);
        // const result = await userModel.exists(decodedToken._id)
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
