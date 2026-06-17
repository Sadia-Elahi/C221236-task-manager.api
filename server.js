const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

/* =========================
   Demo Users
========================= */

const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "Rahim",
    email: "rahim@gmail.com",
    password: "user123",
    role: "user",
  },
  {
    id: 3,
    name: "Karim",
    email: "karim@gmail.com",
    password: "user123",
    role: "user",
  },
  {
    id: 4,
    name: "Sadia",
    email: "sadia@gmail.com",
    password: "user123",
    role: "user",
  },
  {
    id: 5,
    name: "Afroja",
    email: "afroja@gmail.com",
    password: "user123",
    role: "user",
  },
];

/* =========================
   Demo Tasks
========================= */

let tasks = [
  {
    id: 1,
    title: "Create Login Page",
    description: "Design and develop login page UI",
    status: "pending",
    assignedTo: 2,
    createdBy: 1,
  },
  {
    id: 2,
    title: "Prepare Report",
    description: "Prepare project documentation",
    status: "in-progress",
    assignedTo: 3,
    createdBy: 1,
  },
  {
    id: 3,
    title: "Test API",
    description: "Test all task manager API endpoints",
    status: "pending",
    assignedTo: 4,
    createdBy: 1,
  },
];

let taskIdCounter = 4;

/* =========================
   Middleware
========================= */

const verifyToken = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  // Option 1: Authorization header
  // Authorization: Bearer token
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }

  // Option 2: URL query token
  // Example: /api/tasks?token=YOUR_TOKEN
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // Option 3: Body token
  // Example: { "token": "YOUR_TOKEN" }
  if (!token && req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token.",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
};

/* =========================
   Auth Routes
========================= */

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.get("/api/auth/profile", verifyToken, (req, res) => {
  res.json({
    message: "Profile data fetched successfully.",
    user: req.user,
  });
});

/* =========================
   User Routes
========================= */

app.get("/api/users", verifyToken, adminOnly, (req, res) => {
  const safeUsers = users.map(({ password, ...user }) => user);

  res.json({
    message: "All users fetched successfully.",
    users: safeUsers,
  });
});

/* =========================
   Task Routes
========================= */

// Admin: all tasks
// User: only own tasks
app.get("/api/tasks", verifyToken, (req, res) => {
  if (req.user.role === "admin") {
    const allTasks = tasks.map((task) => {
      const assignedUser = users.find((u) => u.id === task.assignedTo);

      return {
        ...task,
        assignedUser: assignedUser
          ? {
              id: assignedUser.id,
              name: assignedUser.name,
              email: assignedUser.email,
            }
          : null,
      };
    });

    return res.json({
      message: "All tasks fetched successfully.",
      tasks: allTasks,
    });
  }

  const ownTasks = tasks.filter((task) => task.assignedTo === req.user.id);

  res.json({
    message: "Your tasks fetched successfully.",
    tasks: ownTasks,
  });
});

// Single task
app.get("/api/tasks/:id", verifyToken, (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  if (req.user.role !== "admin" && task.assignedTo !== req.user.id) {
    return res.status(403).json({
      message: "Access denied. You can only view your own task.",
    });
  }

  res.json({
    message: "Task fetched successfully.",
    task,
  });
});

// Admin creates task
app.post("/api/tasks", verifyToken, adminOnly, (req, res) => {
  const { title, description, status, assignedTo } = req.body;

  if (!title || !description || !assignedTo) {
    return res.status(400).json({
      message: "Title, description, and assignedTo are required.",
    });
  }

  const assignedUser = users.find(
    (u) => u.id === Number(assignedTo) && u.role === "user"
  );

  if (!assignedUser) {
    return res.status(400).json({
      message: "Invalid assigned user.",
    });
  }

  const newTask = {
    id: taskIdCounter++,
    title,
    description,
    status: status || "pending",
    assignedTo: Number(assignedTo),
    createdBy: req.user.id,
  };

  tasks.push(newTask);

  res.status(201).json({
    message: "Task created and assigned successfully.",
    task: newTask,
  });
});

// Update task
app.put("/api/tasks/:id", verifyToken, (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  // Admin can update all fields
  if (req.user.role === "admin") {
    const { title, description, status, assignedTo } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    if (assignedTo) {
      const assignedUser = users.find(
        (u) => u.id === Number(assignedTo) && u.role === "user"
      );

      if (!assignedUser) {
        return res.status(400).json({
          message: "Invalid assigned user.",
        });
      }

      task.assignedTo = Number(assignedTo);
    }

    return res.json({
      message: "Task updated successfully by admin.",
      task,
    });
  }

  // User can update only own task status
  if (task.assignedTo !== req.user.id) {
    return res.status(403).json({
      message: "Access denied. You can only update your own task.",
    });
  }

  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "User can update only task status.",
    });
  }

  task.status = status;

  res.json({
    message: "Task status updated successfully.",
    task,
  });
});

// Admin deletes task
app.delete("/api/tasks/:id", verifyToken, adminOnly, (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found.",
    });
  }

  tasks = tasks.filter((t) => t.id !== taskId);

  res.json({
    message: "Task deleted successfully.",
    deletedTask: task,
  });
});

/* =========================
   Default Route
========================= */

app.get("/", (req, res) => {
  res.send("Task Manager API is running...");
});

/* =========================
   Server Start
========================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});