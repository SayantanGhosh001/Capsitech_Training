const Team = require("../models/teamModel");
const User = require("../models/userModel");

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;

    // Validate team name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = new Team({
      name,
      members: members || [],
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all teams with pagination and filtering
exports.getTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const memberCount = req.query.memberCount || "all"; // all, empty, notEmpty

    // Build filter query
    const query = {};

    // Search by team name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by member count
    if (memberCount === "empty") {
      query["members.0"] = { $exists: false };
    } else if (memberCount === "notEmpty") {
      query["members.0"] = { $exists: true };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute query with filters and pagination
    const teams = await Team.find(query)
      .populate("members.user", "name email")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Get total count for pagination
    const total = await Team.countDocuments(query);

    // Get member counts for each team
    const teamsWithCounts = teams.map((team) => {
      const teamObj = team.toObject();
      teamObj.memberCount = team.members.length;
      return teamObj;
    });

    res.json({
      teams: teamsWithCounts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTeams: total,
      hasMore: page < Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a team
exports.updateTeam = async (req, res) => {
  try {
    const { name, members } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (name) team.name = name;
    if (members) team.members = members;

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add member to team
exports.addTeamMember = async (req, res) => {
  try {
    const { userId, designation } = req.body;

    // Validate inputs
    if (!userId || !designation) {
      return res
        .status(400)
        .json({ message: "User ID and designation are required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is already a member
    if (team.members.some((member) => member.user.toString() === userId)) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    team.members.push({ user: userId, designation });
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove member from team
exports.removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.members = team.members.filter(
      (member) => member.user.toString() !== userId
    );
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
