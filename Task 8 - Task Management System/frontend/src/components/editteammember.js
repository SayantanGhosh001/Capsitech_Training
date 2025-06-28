import { useState, useEffect } from "react";
import { getAllUsers, updateTeam } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EditTeamMember = ({ team, onClose, onTeamUpdated }) => {
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState(team.members);
  const [selectedUser, setSelectedUser] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error loading users. Please try again.");
      }
    };

    loadUsers();
  }, []);

  const handleAddMember = () => {
    if (!selectedUser || !designation) {
      alert("Please select a user and enter a designation");
      return;
    }

    const selectedUserData = users.find((u) => u._id === selectedUser);
    if (!selectedUserData) return;

    // Check if user is already a member
    if (members.some((m) => m.user._id === selectedUser)) {
      alert("This user is already a team member");
      return;
    }

    setMembers([
      ...members,
      {
        user: {
          _id: selectedUserData._id,
          name: selectedUserData.name,
          email: selectedUserData.email,
        },
        designation,
      },
    ]);

    setSelectedUser("");
    setDesignation("");
  };

  const handleRemoveMember = (userId) => {
    setMembers(members.filter((member) => member.user._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedTeam = await updateTeam(team._id, {
        name: team.name,
        members: members.map((m) => ({
          user: m.user._id,
          designation: m.designation,
        })),
      });
      onTeamUpdated(updatedTeam);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error updating team members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
          Edit Team Members - {team.name}
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />

            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={!selectedUser || !designation}
            >
              Add
            </button>
          </div>

          <div className="border rounded-lg divide-y">
            {members.map((member) => (
              <div
                key={member.user._id}
                className="flex justify-between items-center p-3"
              >
                <div>
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-gray-600">{member.designation}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.user._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-gray-500 p-3">No members added yet</p>
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
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeamMember;
