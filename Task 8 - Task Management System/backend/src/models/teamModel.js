const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
); // Disable automatic _id for subdocuments

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Team name is required"],
    trim: true,
  },
  members: [memberSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
teamSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure no duplicate members in a team
teamSchema.path("members").validate(function (members) {
  const userIds = members.map((m) => m.user.toString());
  return userIds.length === new Set(userIds).size;
}, "Team members must be unique");

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
