const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const Task = require("./models/Task"); // Adjust path as per your project structure

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
     credentials: true, // If using cookies or sessions
  },
});

mongoose.connect(
  "mongodb+srv://mehulkotak40:Mrk%402004@prac0.jn2cx0w.mongodb.net/To_do_list"
);

app.use(cors());
app.use(express.json());

// Your routes setup (e.g., '/tasks', '/users', etc.)
app.use("/tasks", require("./routes/Tasks"));

// Socket.IO integration for real-time updates
io.on("connection", (socket) => {
  console.log("A user connected");

  // Example: Emit task updates to connected clients
  socket.on("createTask", async (task) => {
    try {
      const newTask = await Task.create(task);
      io.emit("taskCreated", newTask); // Emit event to all connected clients
    } catch (err) {
      console.error("Error creating task:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
