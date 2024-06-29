const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // Validate that the dueDate is today or a future date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours to 0 for accurate comparison
        return value && value >= today;
      },
      message: "Due date must be today or in the future",
    },
  },
  assignee: {
    type: String,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
