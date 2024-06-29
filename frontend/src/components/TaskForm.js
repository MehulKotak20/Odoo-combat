import React, { useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import "./TaskForm.css";

function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState(""); // Default to empty string
  const [priority, setPriority] = useState("Medium"); // Default to "Medium"

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Apply defaults if necessary
    const newTask = {
      title,
      description,
      dueDate,
      assignee: assignee || "Not assigned", // Default to "Not assigned" if empty
      priority: priority || "Low", // Default to "Low" if empty
    };

    try {
      const response = await api.post("/tasks", newTask);
      socket.emit("createTask", response.data);
      setTitle("");
      setDescription("");
      setDueDate("");
      setAssignee("");
      setPriority("");

      console.log("Task created successfully:", response.data);

      // Refresh the page after successful task creation
      window.location.reload();
    } catch (error) {
      console.error("Error creating task:", error);
      // Handle specific errors or provide user feedback
      if (error.response) {
        // Server responded with an error status code (4xx or 5xx)
        console.log("Server error:", error.response.data);
        // Display a user-friendly error message or take appropriate action
      } else if (error.request) {
        // Request made but no response received
        console.log("No response received:", error.request);
        // Handle network errors or timeouts
      } else {
        // Something else happened while setting up the request
        console.log("Request error:", error.message);
        // Handle unexpected errors
      }
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="task-form-container">
      <h2>Create a New Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={todayDate}
            required
          />
        </div>
        <div className="form-group">
          <label>Assignee:</label>
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
}

export default TaskForm;
