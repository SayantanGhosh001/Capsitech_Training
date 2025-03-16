import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Tasks = () => {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const navigate = useNavigate();

  // Fetch tasks from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTasks(res.data))
      .catch((err) => {
        console.error("token expired", err);
        toast.error("Time out! Login again", {
                autoClose: 3000,
                theme: "colored",
              });
        navigate("/login");
      });
  }, [token]);

  // Handle input changes for new task
  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Add new task (POST request)
  // Add new task with try-catch block
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return; // Prevent empty title

    try {
      const res = await axios.post("http://localhost:5000/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks([...tasks, res.data]); // Update UI
      setNewTask({ title: "", description: "" }); // Clear form
    } catch (err) {
      console.error("Error adding task", err);
      toast.error("Time out! Login again", {
        autoClose: 3000,
        theme: "colored",
      });
      navigate("/login");
    }
  };

  // Enable edit mode and pre-fill fields
  const enableEdit = (task) => {
    setEditTask(task._id);
    setEditForm({ title: task.title, description: task.description });
  };

  // Update task with try-catch block
  const updateTask = async (taskId) => {
    if (!editForm.title.trim()) return; // Prevent saving empty title

    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks(tasks.map((task) => (task._id === taskId ? res.data : task)));
      setEditTask(null);
    } catch (err) {
      console.error("Error updating task", err);
      toast.error("Time out! Login again", {
        autoClose: 3000,
        theme: "colored",
      });
      navigate("/login");
    }
  };

  // Delete task with try-catch block
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId)); // Remove from UI
    } catch (err) {
      console.error("Error deleting task", err);
      toast.error("Time out! Login again", {
        autoClose: 3000,
        theme: "colored",
      });
      navigate("/login");
    }
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center py-3 px-4">
      <div className="flex justify-between w-full mb-6 border-b-[1px] border-white pb-3">
        <h1 className="sm:text-3xl md:text-4xl text-xl font-bold text-gray-100 text-center">
          Task Manager
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Form to add new task */}
      <form
        onSubmit={addTask}
        className="bg-[#000000] shadow-md p-4 md:p-6 rounded-lg w-full max-w-lg flex flex-col gap-4 mt-3"
      >
        <input
          name="title"
          placeholder="Task Title"
          value={newTask.title}
          onChange={handleChange}
          required
          className="p-2 border text-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <textarea
          name="description"
          placeholder="Task Description"
          value={newTask.description}
          onChange={handleChange}
          className="p-2 border text-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Add Task
        </button>
      </form>

      {/* Display tasks */}
      <ul className="mt-6 w-full flex flex-wrap justify-center">
        {tasks.map((task) => (
          <li
            key={task._id}
            className="bg-[#0c0c0c] border-[#bb86fc] border shadow-md p-4 md:p-5 rounded-lg mb-4 flex flex-col gap-2 m-2 w-[300px] justify-center"
          >
            {editTask === task._id ? (
              <div className="flex flex-col gap-2">
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="p-2 border text-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="p-2 border text-white border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateTask(task._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditTask(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white flex justify-end mt-[-10px] pb-1 border-b-1 border-white mb-1.5">{formatDate(today)}</p>
                <h3 className="text-lg font-semibold text-[#7d84ff] font-[Roboto]">
                  {task.title}
                </h3>
                <p className="text-white ">{task.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => enableEdit(task)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
