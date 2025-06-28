import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Helper function to get token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token;
};

// =======================
// User Authentication
// =======================

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("users/login", credentials);
    return response.data;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }
};

export const registerUser = async (userData) => {
  const response = await API.post("users/register", userData);
  return response.data;
};

// =======================
// User Management (Admin Only)
// =======================

export const fetchUsers = async (token) => {
  try {
    console.log("Making API request with token:", token);
    const response = await API.get("users/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error);
    return [];
  }
};

export const updateUser = async (userId, updatedData, token) => {
  try {
    console.log("Updating user:", userId, "with data:", updatedData);

    const response = await API.put(`users/${userId}`, updatedData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Updated user successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update user error:", error.response?.data || error);
    throw error;
  }
};

export const deleteUser = async (userId, token) => {
  try {
    await API.delete(`users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("User deleted successfully:", userId);
  } catch (error) {
    console.error("Delete user error:", error.response?.data || error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await API.get("/users/all", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error);
    throw error;
  }
};

// =======================
// Project CRUD Operations
// =======================

export const fetchProjects = async (token) => {
  const response = await API.get("/projects", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchProjectDetails = async (id, token) => {
  try {
    const response = await API.get(`/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching project details:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchProjectUsers = async (projectId, token) => {
  try {
    const response = await API.get(`/projects/${projectId}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Expected to return an array of assigned users
  } catch (error) {
    console.error(
      "Error fetching project users:",
      error.response?.data || error
    );
    throw error;
  }
};

export const createProject = async (projectData, token) => {
  try {
    const response = await API.post("/projects", projectData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error.response?.data || error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData, token) => {
  const response = await API.put(`/projects/${projectId}`, projectData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteProject = async (projectId, token) => {
  try {
    await API.delete(`/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Project deleted successfully:", projectId);
  } catch (error) {
    console.error("Delete project error:", error.response?.data || error);
    throw error;
  }
};

// =======================
// Task Management
// =======================

// Fetch tasks for a specific project
export const fetchTasks = async (projectId, token) => {
  try {
    const response = await API.get(`/tasks/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error.response?.data || error);
    throw error;
  }
};

// Create a new task for a project (Admin Only)
export const createTask = async (projectId, taskData, token) => {
  try {
    const response = await API.post(`/tasks/${projectId}`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error.response?.data || error);
    throw error;
  }
};

// Update a task (Assigned users can update status. and admin can do update anything)
export const updateTask = async (taskId, updatedData, token) => {
  try {
    const response = await API.put(`/tasks/${taskId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating task:", error.response?.data || error);
    throw error;
  }
};

// Delete a task (Admin Only)
export const deleteTask = async (taskId, token) => {
  try {
    await API.delete(`/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Task deleted successfully:", taskId);
  } catch (error) {
    console.error("Error deleting task:", error.response?.data || error);
    throw error;
  }
};

// Team API endpoints
export const createTeam = async (teamData) => {
  try {
    const response = await API.post("/teams", teamData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error.response?.data || error);
    throw error;
  }
};

export const getTeams = async (queryString = "") => {
  try {
    const response = await API.get(`/teams?${queryString}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error.response?.data || error);
    throw error;
  }
};

export const getTeamById = async (teamId) => {
  const response = await API.get(`/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await API.put(`/teams/${teamId}`, teamData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await API.delete(`/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const addTeamMember = async (teamId, userData) => {
  try {
    const response = await API.post(`/teams/${teamId}/members`, userData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding team member:", error.response?.data || error);
    throw error;
  }
};

export const removeTeamMember = async (teamId, userId) => {
  try {
    const response = await API.delete(`/teams/${teamId}/members`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      data: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing team member:", error.response?.data || error);
    throw error;
  }
};
