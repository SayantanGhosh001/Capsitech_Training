const Task = require("../models/taskModel");
const Project = require("../models/projectModel");

const getTasks = async (req, res) => {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === "admin";
  
      // Check if the user is part of the project
      const project = await Project.findOne({
        _id: req.params.projectId,
        $or: [{ createdBy: userId }, { assignedUsers: userId }],
      });
  
      if (!project && !isAdmin) {
        return res.status(403).json({ message: "Access Denied: You are not assigned to this project" });
      }
  
      let filter = { projectId: req.params.projectId, isDelete: false };
  
      if (isAdmin) {
        // Admin can see all tasks, including soft-deleted ones
        delete filter.isDelete;
      } else {
        // Normal users see only tasks assigned to them
        filter.assignedUsers = userId;
      }
  
      const tasks = await Task.find(filter)
        .populate("assignedUsers", "name email")
        .populate("createdBy", "name");
  
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
  };
  

const createTask = async (req, res) => {
    const { taskTitle, taskDescription, taskStatus, startDate, endDate, assignedUsers } = req.body;
    const projectId = req.params.projectId; // Extract projectId from URL
    const createdBy = req.user.id;

    try {
        if (!taskTitle || !projectId) {
            return res.status(400).json({ message: "Task title and project ID are required" });
        }

        const newTask = new Task({
            taskTitle,
            taskDescription,
            taskStatus: taskStatus || "Pending",
            startDate,
            endDate,
            projectId,
            assignedUsers,
            createdBy,
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating task" });
    }
};


const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { taskTitle, taskDescription, taskStatus, startDate, endDate, assignedUsers, isDelete } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
  
    try {
      let task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      if (isAdmin) {
        task.taskTitle = taskTitle ?? task.taskTitle;
        task.taskDescription = taskDescription ?? task.taskDescription;
        task.taskStatus = taskStatus ?? task.taskStatus;
        task.startDate = startDate ?? task.startDate;
        task.endDate = endDate ?? task.endDate;
        task.assignedUsers = assignedUsers ?? task.assignedUsers;
        task.isDelete = isDelete ?? task.isDelete; // Admin can soft delete
      } else {
        // Normal users: Only update taskStatus if they are assigned
        if (!task.assignedUsers.includes(userId)) {
          return res.status(403).json({ message: "You are not assigned to this task" });
        }
        task.taskStatus = taskStatus ?? task.taskStatus;
      }
  
      await task.save();
      res.json({ message: "Task updated successfully", task });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only admin can delete tasks permanently" });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ message: "Task permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};
  

module.exports = { getTasks, createTask, updateTask, deleteTask };
