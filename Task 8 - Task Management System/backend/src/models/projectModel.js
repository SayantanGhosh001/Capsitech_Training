const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      category: { type: String, required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], 
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, required: true },
      projectStatus: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" }, 
      isDelete: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
