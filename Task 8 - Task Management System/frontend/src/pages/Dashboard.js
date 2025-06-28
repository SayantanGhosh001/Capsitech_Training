import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import {
  fetchProjects,
  fetchUsers,
  updateUser,
  deleteUser,
  getTeams,
  removeTeamMember,
  deleteTeam,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/createproject";
import CreateUser from "../components/createuser";
import CreateTeam from "../components/createteam";
import Navbar from "../components/navbar";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchProjectTerm, setSearchProjectTerm] = useState("");
  const [sortProjectOrder, setSortProjectOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("title");
  const [statusProjectFilter, setStatusProjectFilter] = useState("All");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  // Users pagination state
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    isActive: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;

  // Projects pagination state
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const projectsPerPage = 9;

  // Projects pagination handlers
  const handleNextProjectPage = () => {
    if (currentProjectPage < totalProjectPages)
      setCurrentProjectPage(currentProjectPage + 1);
  };

  const handlePrevProjectPage = () => {
    if (currentProjectPage > 1) setCurrentProjectPage(currentProjectPage - 1);
  };

  const filteredUsers = users
    .filter(
      (user) =>
        (filterRole === "all" || user.role === filterRole) && // Role filter
        (statusFilter === "All" ||
          (statusFilter === "Active" ? user.isActive : !user.isActive)) && // Status filter
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) // Search filter
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Pagination Handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const filteredProjects = projects
    .filter((project) => {
      const statusMatch =
        statusProjectFilter === "All" ||
        project.projectStatus === statusProjectFilter ||
        (statusProjectFilter === "Deleted" && project.isDelete);

      return (
        statusMatch &&
        project.title.toLowerCase().includes(searchProjectTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return sortProjectOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortProjectOrder === "asc"
          ? new Date(a.startDate) - new Date(b.startDate)
          : new Date(b.startDate) - new Date(a.startDate);
      }
    });

  // Calculate pagination values for projects
  const totalProjectPages = Math.ceil(
    filteredProjects.length / projectsPerPage
  );
  const projectStartIndex = (currentProjectPage - 1) * projectsPerPage;
  const projectEndIndex = projectStartIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(
    projectStartIndex,
    projectEndIndex
  );

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const projectData = await fetchProjects(user.token);
        setProjects(projectData);
        if (user?.role === "admin") {
          const usersData = await fetchUsers(user.token);
          setUsers(usersData);
          const teamsData = await getTeams();
          setTeams(teamsData.teams || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user?.token) {
      loadDashboardData();
    }
  }, [user]);

  const handleUpdateClick = (userItem) => {
    setEditUser(userItem._id);
    setFormData({
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      isActive: userItem.isActive,
    });
  };

  const handleUpdateSubmit = async () => {
    try {
      const updatedUser = await updateUser(editUser, formData, user.token);
      setUsers(
        users.map((u) => (u._id === editUser ? { ...u, ...updatedUser } : u))
      );
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId, user.token);
      setUsers(users.filter((u) => u._id !== userId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const [editingTeam, setEditingTeam] = useState(null);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newMemberDesignation, setNewMemberDesignation] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);

  const handleTeamNameUpdate = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name: editedTeamName }),
      });

      if (response.ok) {
        setTeams(
          teams.map((team) =>
            team._id === teamId ? { ...team, name: editedTeamName } : team
          )
        );
        setEditingTeam(null);
        setEditedTeamName("");
      }
    } catch (error) {
      console.error("Error updating team name:", error);
    }
  };

  const handleAddMembers = async () => {
    try {
      const response = await fetch(
        `/api/teams/${selectedTeamForMembers._id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            members: selectedUsers.map((userId) => ({
              user: userId,
              designation: newMemberDesignation,
            })),
          }),
        }
      );

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams(
          teams.map((team) =>
            team._id === selectedTeamForMembers._id ? updatedTeam : team
          )
        );
        setShowAddMemberModal(false);
        setSelectedUsers([]);
        setNewMemberDesignation("");
      }
    } catch (error) {
      console.error("Error adding team members:", error);
    }
  };

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (user?.role === "admin") {
      fetchAvailableUsers();
    }
  }, [user]);

  const [teamFilters, setTeamFilters] = useState({
    search: "",
    sortField: "createdAt",
    sortOrder: "desc",
    memberCount: "all",
    page: 1,
    limit: 9,
  });
  const [teamStats, setTeamStats] = useState({
    totalTeams: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const fetchTeamsData = async (filters = teamFilters) => {
    setIsLoadingTeams(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        memberCount: filters.memberCount,
      });

      const teamsData = await getTeams(queryParams.toString());
      setTeams(teamsData.teams);
      setTeamStats({
        totalTeams: teamsData.totalTeams,
        totalPages: teamsData.totalPages,
        hasMore: teamsData.hasMore,
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    if (activeTab === "teams") {
      fetchTeamsData();
    }
  }, [activeTab, teamFilters]);

  const handleTeamFilterChange = (filterName, value) => {
    const newFilters = {
      ...teamFilters,
      [filterName]: value,
      // Reset page to 1 when filters change (except for page changes)
      page: filterName === "page" ? value : 1,
    };
    setTeamFilters(newFilters);
  };

  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState(null);

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteTeam(teamId);
      // Refresh teams list after deletion
      const teamsData = await getTeams();
      setTeams(teamsData.teams || []);
      setConfirmDeleteTeam(null);
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team. Please try again.");
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    try {
      await removeTeamMember(teamId, memberId);
      // Refresh teams after removing member
      fetchTeamsData();
    } catch (error) {
      console.error("Error removing team member:", error);
      alert("Failed to remove team member. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex mt-[60px]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6 border-r border-gray-100">
          <div className="flex items-center mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          </div>

          <nav className="space-y-2">
            {user?.role === "admin" && (
              <>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "users"
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>Members</span>
                </button>

                <button
                  onClick={() => setActiveTab("teams")}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "teams"
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Teams</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "projects"
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Projects</span>
            </button>
          </nav>

          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full mt-8 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome,{" "}
                <span className="text-blue-600 uppercase">{user?.name}</span>
              </h2>
              <p className="text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {user?.name.charAt(0)}
            </div>
          </header>

          {user?.role === "admin" && activeTab === "projects" && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Admin Panel
                </h3>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    New Project
                  </button>
                )}
              </div>

              {showForm && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <CreateProjectForm onCancel={() => setShowForm(false)} />
                </div>
              )}
            </div>
          )}

          {activeTab === "users" ? (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    User Management
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage all system users and their permissions
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  New User
                </button>
              </div>

              {showCreateUserModal && (
                <CreateUser onClose={() => setShowCreateUserModal(false)} />
              )}

              {/* Filters Section */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {sortOrder === "asc" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                        />
                      </svg>
                    )}
                    Sort
                  </button>
                </div>
              </div>

              {/* Users Table */}
              {currentUsers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-600">
                    No users found
                  </h4>
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search or create a new user
                  </p>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="mt-4 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create New User
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((userItem) => (
                        <tr
                          key={userItem._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-medium mr-3 shadow-inner">
                                {userItem.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {userItem.name}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  Joined{" "}
                                  {new Date(
                                    userItem.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {userItem.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                userItem.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {userItem.role.charAt(0).toUpperCase() +
                                userItem.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                userItem.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {userItem.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleUpdateClick(userItem)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => setConfirmDelete(userItem._id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {filteredUsers.length > usersPerPage && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredUsers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : activeTab === "teams" ? (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Teams Overview
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {teamStats.totalTeams} teams found
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {/* Search with icon */}
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={teamFilters.search}
                      onChange={(e) =>
                        handleTeamFilterChange("search", e.target.value)
                      }
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Sort Controls */}
                  <button
                    onClick={() =>
                      handleTeamFilterChange(
                        "sortOrder",
                        teamFilters.sortOrder === "asc" ? "desc" : "asc"
                      )
                    }
                    className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {teamFilters.sortOrder === "asc" ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                        />
                      </svg>
                    )}
                    Sort
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowCreateTeamModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Team
                    </button>
                  )}
                </div>
              </div>

              {/* Teams Grid */}
              {isLoadingTeams ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-600">
                    No teams found
                  </h4>
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search or create a new team
                  </p>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowCreateTeamModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      Create Team
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                      <div
                        key={team._id}
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            {editingTeam === team._id ? (
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={editedTeamName}
                                  onChange={(e) =>
                                    setEditedTeamName(e.target.value)
                                  }
                                  className="border rounded px-2 py-1 text-lg w-full"
                                />
                                <button
                                  onClick={() => handleTeamNameUpdate(team._id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingTeam(null);
                                    setEditedTeamName("");
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold">
                                  {team.name}
                                </h3>
                              </div>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              {team.members.length} members
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setConfirmDeleteTeam(team._id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {team.members.map((member) => (
                            <div
                              key={member.user._id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.user.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {member.designation}
                                </p>
                              </div>
                              {user?.role === "admin" && (
                                <button
                                  onClick={() =>
                                    handleRemoveMember(
                                      team._id,
                                      member.user._id
                                    )
                                  }
                                  className="text-red-500 hover:text-red-600 p-1"
                                  title="Remove Member"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {teamStats.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 px-4">
                      <div className="text-sm text-gray-600">
                        Showing {(teamFilters.page - 1) * teamFilters.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          teamFilters.page * teamFilters.limit,
                          teamStats.totalTeams
                        )}{" "}
                        of {teamStats.totalTeams} teams
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleTeamFilterChange("page", teamFilters.page - 1)
                          }
                          disabled={teamFilters.page === 1}
                          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            teamFilters.page === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            handleTeamFilterChange("page", teamFilters.page + 1)
                          }
                          disabled={!teamStats.hasMore}
                          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            !teamStats.hasMore
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Project Overview
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {filteredProjects.length} projects found
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {/* Search with icon */}
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchProjectTerm}
                      onChange={(e) => setSearchProjectTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusProjectFilter}
                    onChange={(e) => setStatusProjectFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    {user?.role === "admin" && (
                      <option value="Deleted">Deleted</option>
                    )}
                  </select>

                  {/* Sort Controls */}
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="title">Sort by</option>
                      <option value="title">Name</option>
                      <option value="startDate">Date</option>
                    </select>

                    <button
                      onClick={() =>
                        setSortProjectOrder(
                          sortProjectOrder === "asc" ? "desc" : "asc"
                        )
                      }
                      className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      {sortProjectOrder === "asc" ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                          />
                        </svg>
                      )}
                      Sort
                    </button>
                  </div>
                </div>
              </div>

              {/* Projects List */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-600">
                    No projects found
                  </h4>
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search or create a new project
                  </p>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      Create Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProjects.map((project) => {
                    let statusColor = "bg-gray-100 text-gray-800";
                    if (project.projectStatus === "Completed")
                      statusColor = "bg-green-100 text-green-800";
                    else if (project.projectStatus === "Pending")
                      statusColor = "bg-red-100 text-red-800";
                    else if (project.projectStatus === "In Progress")
                      statusColor = "bg-yellow-100 text-yellow-800";

                    return (
                      <div
                        key={project._id}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className={`group border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer ${
                          project.isDelete
                            ? "opacity-30"
                            : "hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {project.title}
                          </h4>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} whitespace-nowrap`}
                          >
                            {project.projectStatus}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {project.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                            {project.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {new Date(project.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Projects Pagination */}
              {filteredProjects.length > projectsPerPage && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">{projectStartIndex + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(projectEndIndex, filteredProjects.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredProjects.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevProjectPage}
                      disabled={currentProjectPage === 1}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentProjectPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextProjectPage}
                      disabled={currentProjectPage === totalProjectPages}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentProjectPage === totalProjectPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Update User Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Update User
                </h3>
                <button
                  onClick={() => setEditUser(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="active-checkbox"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="active-checkbox"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active account
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mt-3">
                  Confirm Deletion
                </h3>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
              </div>

              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {confirmLogout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mt-3">
                  Confirm Logout
                </h3>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to log out?
                </p>
              </div>

              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    setConfirmLogout(false);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateTeamModal && (
          <CreateTeam
            onClose={() => setShowCreateTeamModal(false)}
            onTeamCreated={(newTeam) => {
              setTeams([...teams, newTeam]);
              setShowCreateTeamModal(false);
            }}
          />
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Add Team Members
                </h3>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUsers([]);
                    setNewMemberDesignation("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">
                  Team Members
                </h4>
                <div className="bg-white rounded-lg border border-gray-200">
                  {availableUsers.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user._id)
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-800">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  value={newMemberDesignation}
                  onChange={(e) => setNewMemberDesignation(e.target.value)}
                  placeholder="Enter designation for selected members"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUsers([]);
                    setNewMemberDesignation("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  disabled={
                    selectedUsers.length === 0 || !newMemberDesignation.trim()
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  Add Members
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Team Confirmation Modal */}
        {confirmDeleteTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Delete Team
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this team? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDeleteTeam(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTeam(confirmDeleteTeam)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
