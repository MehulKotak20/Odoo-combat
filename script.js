document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:3000");
  const taskForm = document.getElementById("task-form");
  const taskTitle = document.getElementById("task-title");
  const taskDescription = document.getElementById("task-description");
  const taskList = document.getElementById("task-list");

  // Fetch initial tasks
  fetchTasks();

  function fetchTasks() {
    fetch("http://localhost:3000/tasks")
      .then((response) => response.json())
      .then((tasks) => {
        tasks.forEach((task) => addTaskToList(task));
      });
  }

  // Handle form submission
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const task = {
      title: taskTitle.value,
      description: taskDescription.value,
    };

    fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    })
      .then((response) => response.json())
      .then((newTask) => {
        socket.emit("createTask", newTask);
        taskTitle.value = "";
        taskDescription.value = "";
      });
  });

  // Handle real-time updates
  socket.on("taskCreated", (task) => {
    addTaskToList(task);
  });

  socket.on("taskUpdated", (updatedTask) => {
    const taskItem = document.querySelector(`li[data-id='${updatedTask._id}']`);
    if (taskItem) {
      taskItem.querySelector("input").value = updatedTask.title;
    }
  });

  socket.on("taskDeleted", (taskId) => {
    const taskItem = document.querySelector(`li[data-id='${taskId}']`);
    if (taskItem) {
      taskItem.remove();
    }
  });

  function addTaskToList(task) {
    const taskItem = document.createElement("li");
    taskItem.dataset.id = task._id;
    taskItem.innerHTML = `
      <input type="text" value="${task.title}">
      <button>Delete</button>
    `;

    taskItem.querySelector("input").addEventListener("change", (event) => {
      const updatedTask = {
        ...task,
        title: event.target.value,
      };

      fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      })
        .then((response) => response.json())
        .then(() => {
          socket.emit("updateTask", updatedTask);
        });
    });

    taskItem.querySelector("button").addEventListener("click", () => {
      fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: "DELETE",
      }).then(() => {
        socket.emit("deleteTask", task._id);
      });
    });

    taskList.appendChild(taskItem);
  }
});
