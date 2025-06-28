const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/teamController");

// Team routes
router.post("/", protect, createTeam);
router.get("/", protect, getTeams);
router.get("/:id", protect, getTeamById);
router.put("/:id", protect, updateTeam);
router.delete("/:id", protect, deleteTeam);

// Team member management routes
router.post("/:id/members", protect, addTeamMember);
router.delete("/:id/members", protect, removeTeamMember);

module.exports = router;
