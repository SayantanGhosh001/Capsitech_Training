const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: "Email address is required",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    // minlength: [6, "Password must be at least 6 characters long"],
  },
  
},{timestamps: true});

module.exports = mongoose.model("User", UserSchema);
