import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { fetchProjectUsers, createTask } from "../services/api";

const CreateTaskForm = ({ onCancel, projectId }) => {
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const [formData, setFormData] = useState({
    taskTitle: "",
    taskDescription: "",
    startDate: "",
    endDate: "",
    assignedUsers: [],
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
        if (!token || !projectId) {
            console.error("Token or Project ID missing!");
            return;
        }
        try {
            const response = await fetchProjectUsers(projectId, token);
            console.log("Fetched users:", response);
            setUsers(response);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    getUsers();
}, [token, projectId]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      assignedUsers: checked
        ? [...prev.assignedUsers, value]
        : prev.assignedUsers.filter((id) => id !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const newProject = await createTask(projectId, formData, token);
      console.log("Project Created Successfully:", newProject);
      onCancel();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="p-8 bg-white shadow-xl rounded-xl border border-gray-100">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
    Create New Task
  </h2>
  
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
      <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">Task Title*</label>
      <input
        type="text"
        id="taskTitle"
        name="taskTitle"
        placeholder="Enter task title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        required
      />
    </div>

    <div>
      <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">Task Description*</label>
      <textarea
        id="taskDescription"
        name="taskDescription"
        placeholder="Describe the task details"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        required
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        />
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        />
      </div>
    </div>

    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Assign Team Members</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {users.length > 0 ? (
          users.map((user) => (
            <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
              <input
                type="checkbox"
                value={user._id}
                checked={formData.assignedUsers.includes(user._id)}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 text-gray-700">{user.name}</span>
            </label>
          ))
        ) : (
          <p className="text-gray-500 text-sm p-2">No team members available</p>
        )}
      </div>
    </div>

    <div className="flex justify-end space-x-4 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
      >
        Create Task
      </button>
    </div>
  </form>
</div>
  );
};

export default CreateTaskForm;
