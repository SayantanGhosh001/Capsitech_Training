import { useState, useEffect } from "react";
import { addTeamMember, getAllUsers } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AddTeamMember = ({ teamId, onClose, onMemberAdded }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await getAllUsers();
        console.log("Fetched users:", data); // Debug log
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Error loading users. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !designation) {
      alert("Please select a user and enter a designation");
      return;
    }

    setLoading(true);

    try {
      const response = await addTeamMember(teamId, {
        userId: selectedUser,
        designation,
      });
      onMemberAdded(response);
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error adding team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Add Team Member
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select User
            </label>
            {loadingUsers ? (
              <div className="text-center py-2 text-gray-600">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-2 text-gray-600">
                No users available
              </div>
            ) : (
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white"
                required
              >
                <option value="">Choose a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              placeholder="Enter designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={
                loading || loadingUsers || !selectedUser || !designation
              }
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMember;
