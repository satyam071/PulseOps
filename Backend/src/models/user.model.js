const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  githubId:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  name:{
    type:String,
  },
  avatar:{
    type:String,
  },
  accessToken:{
    type:String,
    select:true
  }

  
},
{timestamps:true})

const userModel = mongoose.model("user",userSchema);

module.exports = userModel