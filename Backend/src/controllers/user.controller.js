const jwt  = require("jsonwebtoken")
const User =require("../models/user.model")

const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({
        message: "No Token Found",
      });
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    if(!decoded){
      return res.status(400).json({
        message:"No token found"
      })
    }

    const user = await User.findById(decoded.id)

    return res.status(200).json({
      message:"User Successfully fetched",
      user
      
    })


  } catch (err) {
    return res.status(401).json({
      message: "Error 404 occured",
    });
  }
};

module.exports = { getMe };
