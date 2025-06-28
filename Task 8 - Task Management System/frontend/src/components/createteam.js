import { useState, useEffect } from "react";
import { createTeam, getAllUsers } from "../services/api";

const CreateTeam = ({ onClose, onTeamCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!selectedUser || !designation) return;

    const user = users.find((u) => u._id === selectedUser);
    if (!user) return;

    setTeamMembers([
      ...teamMembers,
      {
        user: selectedUser,
        designation,
        displayName: user.name, // For display purposes only
      },
    ]);
    setSelectedUser("");
    setDesignation("");
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const team = await createTeam({
        name,
        members: teamMembers.map(({ user, designation }) => ({
          user,
          designation,
        })),
      });
      onTeamCreated(team);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error creating team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Create New Team
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />

          <div className="border-t pt-4 mt-4">
            <h4 className="text-lg font-medium mb-2">Add Team Members</h4>

            <div className="space-y-2">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />

              <button
                type="button"
                onClick={handleAddMember}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!selectedUser || !designation}
              >
                Add Member
              </button>
            </div>

            {teamMembers.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">Team Members:</h5>
                <div className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <span className="font-medium">
                          {member.displayName}
                        </span>
                        <span className="text-gray-600 ml-2">
                          ({member.designation})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading || !name || teamMembers.length === 0}
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
