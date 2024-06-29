import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TaskList.css"; // Import your CSS file for styling

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedTask, setEditedTask] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/tasks"); // Replace with your backend URL
      setTasks(response.data);
      setFilteredTasks(response.data); // Initialize filtered tasks with all tasks
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleEdit = (task) => {
    setEditMode(task._id);
    setEditedTask({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    });
  };

  const handleSave = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}`, editedTask); // Replace with your backend URL
      fetchTasks(); // Refresh task list after update
      setEditMode(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`); // Replace with your backend URL
      fetchTasks(); // Refresh task list after deletion
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleComplete = async (taskId, currentTask) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/tasks/${taskId}`,
        {
          title: currentTask.title,
          description: currentTask.description,
          dueDate: currentTask.dueDate,
          assignee: currentTask.assignee,
          priority: currentTask.priority,
          completed: !currentTask.completed,
          updatedAt: currentTask.updatedAt,
        }
      );

      if (!response.data) {
        throw new Error("Failed to update task");
      }

      fetchTasks(); // Refresh task list after update
    } catch (error) {
      console.error("Error updating task:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
    }
  };

  const handleSearch = () => {
    const filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assignee &&
          task.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTasks(filtered);
  };

  return (
    <div className="task-list-container">
      <h2>Task List</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="task-search"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task._id} className="task-item">
            {editMode === task._id ? (
              <div className="task-edit-form">
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                />
                <textarea
                  value={editedTask.description}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, dueDate: e.target.value })
                  }
                />
                <button onClick={() => handleSave(task._id)}>Save</button>
                <button onClick={() => setEditMode(null)}>Cancel</button>
              </div>
            ) : (
              <div className="task-details">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-meta">
                  <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
                  <p>Status: {task.completed ? "Completed" : "Incomplete"}</p>
                </div>
                <p>{task.description}</p>
                <div className="task-actions">
                  {!task.completed && (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="complete-btn"
                        onClick={() => handleToggleComplete(task._id, task)}
                      >
                        Mark Complete
                      </button>
                    </>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </button>
                </div>
                <p className="task-assignee">
                  Assigned to: {task.assignee || "Not Assigned"}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
