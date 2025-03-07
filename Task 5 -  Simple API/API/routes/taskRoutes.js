const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/Auth");

const router = express.Router();

router.get("/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json(tasks);
});

router.post("/tasks", authMiddleware, async (req, res) => {
  // const { title, description, completed } = req.body;
  const task = new Task({ ...req.body, userId: req.user.userId });
  await task.save();
  res.json(task);
});

router.put("/tasks/:id", authMiddleware, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(task);
});

router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

module.exports = router;
