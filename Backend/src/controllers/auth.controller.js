const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const { encrypt } = require("../utils/crypto");
const User  = require("../models/user.model")

 const github = async (req, res) => {
  try {
    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${process.env.GITHUB_CLIENT_ID}`;

    res.redirect(url);
  } catch (error) {
    res.status(500).json({ message: "Error Occured" });
  }
};


 const githubCallback = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      return res.send(400).json({
        message: "No Access Token Found",
      });
    }

    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET_ID,
        code,
      },
      {
        headers: {
          accept: "application/json",
        },
      },
    );
    if (response.status != 200) {
      return res.send(400).json({
        message: "Token not found",
      });
    }

    const accessToken = await response.data.access_token;
    console.log(accessToken)

    //Get user's profile

    const {data:profile}  = await axios.get("https://api.github.com/user",{
      headers: { Authorization : `Bearer ${accessToken}`},
    });

    let user = await User.findOne( { githubId : profile.id });
    if(!user){
      user = await User.create({
        githubId:profile.id,
        username:profile.login,
        name:profile.name,
        avatar:profile.avatar_url
        // accessToken:encrypt(accessToken)

      })
    }

    const token = jwt.sign(
      {id:user._id}, 
      process.env.JWT_SECRET,
      {
        expiresIn:"7d"
      }
    );

    res.cookie("token",token,{
      httpOnly:true,
    })

    // res.redirect(`${process.env.FRONTEND_URL}/dashboard`)
    res.json({
      message:"User Fetched",
      user
    })

    

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Error occurred" })

  }
};

module.exports = { github, githubCallback };
