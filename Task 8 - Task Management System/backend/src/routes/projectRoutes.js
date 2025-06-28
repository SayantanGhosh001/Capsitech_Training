const express = require("express");
const { 
    createProject, 
    getProjects, 
    getProjectById, 
    getProjectUsers,
    updateProject, 
    deleteProject 
} = require("../controllers/projectController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, isAdmin, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, isAdmin, updateProject);
router.delete("/:id", protect, isAdmin, deleteProject);
router.get("/:id/users", protect, isAdmin, getProjectUsers);

module.exports = router;
