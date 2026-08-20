# AbleSpace — Task & Project Manager

A full-stack task and project management application for organizing projects, tasks, labels, subtasks, and team collaboration.

---

## Live Website

**[https://ablespace-web.onrender.com](https://ablespace-web.onrender.com)**

> **Note:** The application uses Render's free tier. After a period of inactivity, the services may spin down and the first request can take up to a minute to wake them back up. If the site doesn't load right away, wait a moment and refresh.

---

## What it does

AbleSpace lets users manage projects and tasks through a **Kanban board** or **list view**.

Users can create projects, manage tasks, assign members, set priorities and due dates, organize tasks with labels, create subtasks, and add task updates — all in one collaborative workspace.

The application supports **Google login** and a **restricted guest mode**.

---

## Tech stack

- **Next.js** — frontend framework
- **React + TypeScript** — UI development
- **Tailwind CSS** — styling
- **NestJS** — backend API
- **PostgreSQL** — database
- **Prisma** — ORM
- **Google OAuth 2.0** — authentication
- **JWT** — authorization
- **Docker + Docker Compose** — containerization
- **Render** — deployment

---

## Features

### Authentication
- Google OAuth login
- Guest login
- JWT-based authorization
- User profile management
- Logout

### Project Management
- Create, edit, and delete projects
- View project details
- Add tasks to projects

### Task Management
- Create, edit, and delete tasks
- Kanban board and list views
- Task status and priority tracking
- Due dates
- Task search and filters
- Assign members to tasks

### Task Organization
- Labels
- Subtasks
- Task updates
- Task detail views

---

## User permissions

### Google Users
Google-authenticated users have full access according to their role.

They can create, edit, and delete tasks, and manage projects, labels, subtasks, task members, and task updates.

### Guest Users
Guest users have **read-only access**.

They can view available projects and tasks but **cannot create, edit, or delete** tasks or modify application data.

---

## Folder structure

```text
ablespace-task-manager/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   │       ├── auth/
│   │       ├── label/
│   │       ├── project/
│   │       ├── subtask/
│   │       ├── task/
│   │       ├── task-update/
│   │       ├── user/
│   │       └── workspace/
│   │
│   └── web/
│       ├── app/
│       ├── components/
│       └── lib/
│
├── docker-compose.yml
├── package.json
└── package-lock.json
```

---

## Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/nik3006/ablespace-task-manager.git
cd ablespace-task-manager
```

### 2. Configure environment variables

Configure the required environment variables for:

- PostgreSQL database
- JWT authentication
- Google OAuth
- Frontend URL
- API URL

> The project uses `.env` and `.env.local` files for local configuration. These files are excluded from Git and should **not** be committed to the repository.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the application with Docker

Run the frontend, backend, and database together:

```bash
docker compose up -d
```

### 5. Check running containers

```bash
docker compose ps
```

### 6. View logs

**Backend:**
```bash
docker compose logs -f api
```

**Frontend:**
```bash
docker compose logs -f web
```

### 7. Rebuild after code changes

Rebuild all containers:

```bash
docker compose up -d --build
```

Rebuild only the frontend:

```bash
docker compose up -d --build web
```

Rebuild only the backend:

```bash
docker compose up -d --build api
```

---

## Database

AbleSpace uses **PostgreSQL** with **Prisma ORM**.

Migrations are stored in:

```text
apps/api/prisma/migrations/
```

Apply migrations with:

```bash
docker compose exec api sh -c "cd apps/api && npx prisma migrate deploy"
```

---

## Deployment

The application is deployed on **Render**, using separate services for:

- Next.js frontend
- NestJS backend
- PostgreSQL database