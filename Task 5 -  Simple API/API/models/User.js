const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [4, "Username must be at least 4 characters long"],
    maxlength: [20, "Username cannot exceed 20 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
});

module.exports = mongoose.model("User", UserSchema);
