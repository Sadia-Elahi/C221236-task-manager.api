# Task Manager API

This is a Node.js and Express.js based Task Manager API project. The project includes authentication, authorization, CRUD operations, and JSON Web Token (JWT). Admin can assign tasks to users and manage all tasks. Users can only view and update their own assigned tasks.

## Features

* Admin login and user login
* JWT based authentication
* Role based authorization
* Admin can view all users
* Admin can create, read, update, and delete tasks
* Admin can assign tasks to users
* User can view only assigned tasks
* User can update only own task status

## Technologies Used

* Node.js
* Express.js
* JSON Web Token
* CORS
* Dotenv
* Nodemon

## Demo Users

### Admin Login

```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

### User Login

```json
{
  "email": "rahim@gmail.com",
  "password": "user123"
}
```

Other demo users:

```json
{
  "email": "karim@gmail.com",
  "password": "user123"
}
```

```json
{
  "email": "sadia@gmail.com",
  "password": "user123"
}
```

```json
{
  "email": "afroja@gmail.com",
  "password": "user123"
}
```

## Installation

Clone the project:

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
```

Go to the project folder:

```bash
cd task-manager
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root folder and add:

```env
PORT=5000
JWT_SECRET=task_manager_secret_key_2026
```

Run the project:

```bash
npm run dev
```

Server will run on:

```text
http://localhost:5000
```

## API Routes

### Default Route

```http
GET /
```

### Login

```http
POST /api/auth/login
```

### Profile

```http
GET /api/auth/profile
```

### Get All Users

Only admin can access this route.

```http
GET /api/users
```

### Get Tasks

Admin can see all tasks. User can see only own assigned tasks.

```http
GET /api/tasks
```

### Get Single Task

```http
GET /api/tasks/:id
```

### Create Task

Only admin can create and assign tasks.

```http
POST /api/tasks
```

Example body:

```json
{
  "token": "YOUR_ADMIN_TOKEN",
  "title": "Create Dashboard UI",
  "description": "Design dashboard page for task manager",
  "status": "pending",
  "assignedTo": 2
}
```

### Update Task

Admin can update all task fields. User can update only own task status.

```http
PUT /api/tasks/:id
```

Example body for user status update:

```json
{
  "token": "YOUR_USER_TOKEN",
  "status": "completed"
}
```

### Delete Task

Only admin can delete tasks.

```http
DELETE /api/tasks/:id
```

Example body:

```json
{
  "token": "YOUR_ADMIN_TOKEN"
}
```

## Project Requirements Covered

* CRUD operation
* Authentication
* Authorization
* Node.js
* Express.js
* JSON Web Token
* Demo admin and demo users
* Admin task assignment
* User can view only own tasks

## Author

Task Manager API Assignment
