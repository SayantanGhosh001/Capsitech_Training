import { useState, useEffect } from "react";
import { getTeams, deleteTeam, removeTeamMember } from "../services/api";
import CreateTeam from "../components/createteam";
import AddTeamMember from "../components/addteammember";
import EditTeamMember from "../components/editteammember";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async (page = 1) => {
    try {
      const response = await getTeams(page);
      setTeams(response.teams);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = () => {
    setShowCreateTeam(true);
  };

  const handleAddMember = (teamId) => {
    setSelectedTeam(teams.find((t) => t._id === teamId));
    setShowAddMember(true);
  };

  const handleEditMembers = (team) => {
    setSelectedTeam(team);
    setShowEditMember(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await deleteTeam(teamId);
        fetchTeams(currentPage);
        setExpandedTeamId(null);
      } catch (error) {
        console.error("Error deleting team:", error);
        alert(error.response?.data?.message || "Error deleting team");
      }
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      try {
        await removeTeamMember(teamId, userId);
        fetchTeams(currentPage);
      } catch (error) {
        console.error("Error removing team member:", error);
        alert(error.response?.data?.message || "Error removing team member");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTeams(page);
  };

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        <button
          onClick={handleCreateTeam}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            {/* Team Card Header - Always Visible */}
            <div
              onClick={() => toggleTeamExpansion(team._id)}
              className="p-6 cursor-pointer border-b border-gray-100"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {team.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {team.members.length}{" "}
                    {team.members.length === 1 ? "Member" : "Members"}
                  </p>
                </div>
                <div className="text-gray-400">
                  {expandedTeamId === team._id ? (
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedTeamId === team._id && (
              <div className="p-6 bg-gray-50">
                <div className="flex justify-end space-x-2 mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMember(team._id);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    Add Member
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMembers(team);
                    }}
                    className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTeam(team._id);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                    Delete Team
                  </button>
                </div>

                <div className="space-y-3">
                  {team.members.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No members yet
                    </p>
                  ) : (
                    team.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {member.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {member.designation}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.user.email}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(team._id, member.user._id);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
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
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {showCreateTeam && (
        <CreateTeam
          onClose={() => setShowCreateTeam(false)}
          onTeamCreated={() => {
            setShowCreateTeam(false);
            fetchTeams();
          }}
        />
      )}

      {showAddMember && selectedTeam && (
        <AddTeamMember
          teamId={selectedTeam._id}
          onClose={() => {
            setShowAddMember(false);
            setSelectedTeam(null);
          }}
          onMemberAdded={() => {
            setShowAddMember(false);
            setSelectedTeam(null);
            fetchTeams(currentPage);
          }}
        />
      )}

      {showEditMember && selectedTeam && (
        <EditTeamMember
          team={selectedTeam}
          onClose={() => {
            setShowEditMember(false);
            setSelectedTeam(null);
          }}
          onTeamUpdated={() => {
            setShowEditMember(false);
            setSelectedTeam(null);
            fetchTeams(currentPage);
          }}
        />
      )}
    </div>
  );
};

export default Teams;
