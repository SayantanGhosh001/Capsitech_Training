import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { fetchUsers, createProject } from "../services/api";

const CreateProjectForm = ({ onCancel }) => {
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    assignedUsers: [],
    endDate: "",
  });

  const [users, setUsers] = useState([]);
  useEffect(() => {
    const getUsers = async () => {
      if (!token) return;
      try {
        const response = await fetchUsers(token);
        const filteredUsers = response.filter((u) => u.role === "user");
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getUsers();
  }, [token]);
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
      const newProject = await createProject(formData, token);
      console.log("Project Created Successfully:", newProject);
      onCancel();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
  <div className="flex items-center mb-6">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
  </div>

  <form onSubmit={handleSubmit} className="space-y-6">
    
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
        Project Title <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="title"
        name="title"
        placeholder="Enter project title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        required
      />
    </div>

    
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
        Project Description <span className="text-red-500">*</span>
      </label>
      <textarea
        id="description"
        name="description"
        placeholder="Describe the project details"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        required
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        >
          <option value="">Select a category</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile App">Mobile App</option>
          <option value="Data Science">Data Science</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
          Deadline <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        />
      </div>
    </div>

    
    <div> 
  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
  <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
    {users.filter(user => user.isActive).length > 0 ? (
      <div className="space-y-3">
        {users.filter(user => user.isActive).map((user) => (
          <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
            <input
              type="checkbox"
              value={user._id}
              checked={formData.assignedUsers.includes(user._id)}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                {user.name.charAt(0)}
              </div>
              <span className="text-gray-700">{user.name}</span>
            </div>
          </label>
        ))}
      </div>
    ) : (
      <div className="text-center py-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="mt-2 text-gray-500">No active team members available</p>
      </div>
    )}
  </div>
</div>


    
    <div className="flex justify-end space-x-4 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm"
      >
        Create Project
      </button>
    </div>
  </form>
</div>
  );
};

export default CreateProjectForm;
