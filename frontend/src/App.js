import React, { useEffect, useState } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import SearchFilter from "./components/searchFilter";
import "./App.css";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTasks();

    socket.on("taskCreated", (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    handleSearchFilter();
  }, [tasks, searchQuery]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const tasks = await response.json();
      setTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleSearchFilter = () => {
    const query = searchQuery.toLowerCase();
    const filtered = tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query) ||
        task.dueDate.toLowerCase().includes(query) // Ensure dueDate is a string
      );
    });
    setFilteredTasks(filtered);
  };

  return (
    <div className="App">
      <h1>Real-Time To_do_list</h1>
      <TaskForm createTask={createTask} />
      <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <TaskList tasks={filteredTasks} />
    </div>
  );
}

export default App;
