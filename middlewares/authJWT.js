const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;  
  if(token)
  {
    jwt.verify(token, process.env.SECRET,(err,decodedToken)=>{
        if(err){
            console.log(err);
            console.log("doesnt have access")
            res.redirect(`https://${process.env.FRONTEND_URL}/Login`);
        } 
        else{
            console.log("this is")
            console.log(decodedToken)
            res.locals.userID = decodedToken._id;
            next()
        }
    })
  }
  else{
    console.log("no cookie")
    res.redirect(`https://${process.env.FRONTEND_URL}/Login`);
  }
};

module.exports = {requireAuth}