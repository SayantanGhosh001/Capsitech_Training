const express = require("express");
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} = require("../controllers/taskController");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:projectId", protect, getTasks);
router.post("/:projectId", protect, isAdmin, createTask);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, isAdmin, deleteTask);

module.exports = router;
