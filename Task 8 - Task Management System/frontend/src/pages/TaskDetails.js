import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { fetchTasks, updateTask, deleteTask, fetchProjectUsers } from "../services/api";
const TaskDetails = ({ projectId }) => {
  const { user } = useContext(AuthContext);
  const token = user?.token;
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [editData, setEditData] = useState({
    assignedUsers: [],
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const getTasks = async () => {
      if (!token || !projectId) {
        console.error("Token or Project ID missing!");
        return;
      }
      try {
        const response = await fetchTasks(projectId, token);
        setTasks(response);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    const getUsers = async () => {
      if (!token) return;
      try {
        const users = await fetchProjectUsers(projectId, token);
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to fetch users.");
      }
    };
    getUsers();
    getTasks();
  }, [token, projectId]);

  useEffect(() => {
    if (allUsers.length > 0) {
      setEditData((prev) => ({
        ...prev,
        assignedUsers: prev.assignedUsers.filter(id => allUsers.some(u => u._id === id))
      }));
    }
  }, [allUsers]);
  

  const toggleTaskDetails = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };
  const handleEdit = (task) => {
    setEditData({
      ...task,
      endDate: task.endDate ? task.endDate.split("T")[0] : "", 
      assignedUsers: task.assignedUsers.map((u) => u._id) || [],
    });
    setShowEditForm(true);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleUpdate = async () => {
    if (!token) return;
    try {
      await updateTask(editData._id, editData, token);
    const response = await fetchTasks(projectId, token); // ✅ Fetch updated task list
    setTasks(response);
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  const handleDelete = async (taskId) => {
    if (!token) return;
    try {
      await deleteTask(taskId, token);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  return (
    <div className="space-y-6">

  {tasks.length > 0 ? (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
          {/* Task Header */}
          <button
            onClick={() => toggleTaskDetails(task._id)}
            className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${
                task.taskStatus === 'Completed' ? 'bg-green-500' : 
                task.taskStatus === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              <span className="font-semibold text-gray-800">{task.taskTitle}</span>
            </div>
            <span className="text-gray-500 transform transition-transform duration-200">
              {expandedTask === task._id ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          </button>

          {/* Task Details (Collapsible) */}
          {expandedTask === task._id && (
            <div className="p-5 pt-0 border-t border-gray-100 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-800 mt-1">{task.taskDescription || "No description"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    task.taskStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                    task.taskStatus === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {task.taskStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="text-gray-800 mt-1">{new Date(task.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="text-gray-800 mt-1">{new Date(task.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned Team</h3>
                {task.assignedUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.assignedUsers.map((user) => (
                      <span key={user._id} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                        {user.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-1">No team members assigned</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {setSelectedTask(task);setShowDeleteConfirm(true);}}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-700">No tasks available</h3>
      <p className="mt-1 text-gray-500">Create a new task to get started</p>
    </div>
  )}
      {/* Edit Task Modal */}
      {showEditForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Edit Task</h2>
        {isAdmin && (
        <button
          className={`px-4 py-2 flex items-center space-x-2 rounded text-white ${
            editData.isDelete ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          }`}
          onClick={() => setEditData({ ...editData, isDelete: !editData.isDelete })}
        >
          {editData.isDelete ? (
            <>
              {/* Curved Restore Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.6 7.4A9 9 0 1 0 21 12h-2a7 7 0 1 1-2.1-4.9l-2.3 2.3H21V3l-2.4 2.4z"/>
              </svg>
              <span>Restore</span>
            </>
          ) : (
            <>
              {/* Trash Bin Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Move to Bin</span>
            </>
          )}
        </button>
        )}
      </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input
                  type="text"
                  name="taskTitle"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editData.taskTitle}
                  onChange={handleEditChange}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Description</label>
                <textarea
                  type="text"
                  name="taskDescription"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editData.taskDescription}
                  onChange={handleEditChange}
                  disabled={!isAdmin}
                />
              </div>
              {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {allUsers && allUsers?.length > 0 ? (
                    allUsers.map((u) => (
                      <label key={u._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          className="rounded text-blue-500 focus:ring-blue-500"
                          checked={editData?.assignedUsers?.includes(u._id) || false}
                          onChange={(e) => {
                            const updatedUsers = e.target.checked
                              ? [...editData.assignedUsers, u._id]
                              : editData.assignedUsers.filter(id => id !== u._id);
                            setEditData({ ...editData, assignedUsers: updatedUsers });
                          }}
                        />
                        <span>{u?.name || "Unknown User"}</span>
                      </label>
                    ))
                  ) : (
                    <p>Loading users...</p>
                  )}
                </div>
              </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="taskStatus"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editData.taskStatus}
                  onChange={(e) => setEditData({ ...editData, taskStatus: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={editData.endDate}
                    onChange={handleEditChange}
                    disabled={!isAdmin}
                  />
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">Are you sure you want to delete this Task? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedTask?._id && handleDelete(selectedTask._id) && setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TaskDetails;