# AutoTask – Project Management System with Automatic Task Assignment

**Task Management System** is a full-stack web application designed as an engineering diploma thesis project.  
The main goal of the system is to support project managers and teams in organizing work by **automatically assigning tasks** to team members based on their skills, current workload and task requirements.

### Key Features

- Creation and management of projects  
- Adding tasks with required skills and difficulty level  
- Automatic assignment of tasks to the most suitable employees  
- Manual override of automatic assignment  
- Tracking workload and skills of team members  
- Simple role-based access (manager / developer – depending on implementation)  
- Task status management (todo → in progress → done etc.)

### Technology Stack

- **Frontend**: Next.js (Pages Router) + React + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express (custom server) 
- **Database**: PostgreSQL  
- **ORM**: Prisma ORM  
- **Authentication**: JWT (jsonwebtoken) + bcrypt for password hashing
- **State management**: React Context (AuthContext, ThemeContext)
- **HTTP client**: Axios (with interceptors for Bearer token)
- **Language**: TypeScript & JavaScript

### Data Model (Prisma Schema – simplified view)

- **User** – employees / managers (name, email, password, role, workload, skills)  
- **Skill** – available competencies (e.g. "React", "UI/UX", "Backend", "Testing")  
- **UserSkill** – many-to-many relation (which user has which skills)  
- **Project** – projects with name, description, optional manager  
- **Task** – tasks belonging to a project (title, description, difficulty, status, due date, required skills, assigned user)  
- **TaskSkill** – many-to-many relation (which skills are required for the task)

```text
projekt-dyplomowy/
├── frontend/                     # Next.js application
│   ├── app/
│   │   ├── calendar/             # Calendar view
│   │   ├── dashboard/            # Main dashboard
│   │   ├── developers/           # Developers list
│   │   ├── login/                # Login page
│   │   ├── projects/             # Projects management
│   │   ├── skills/               # Skills overview
│   │   ├── tasks/                # Tasks list & creation
│   │   ├── globals.css
│   │   └── layout.js
│   ├── components/
│   │   └── ToastProvider.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   └── userService.js
│   └── package.json
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── controllers/
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── skillController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── roles.js
│   └── routes/
│       ├── projectRoutes.js
│       ├── taskRoutes.js
│       ├── skillRoutes.js
│       └── userRoutes.js
│
├── index.js
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```


### Installation & Local Development

#### Prerequisites

- Node.js ≥ 18
- PostgreSQL (local or cloud – Neon, Supabase, Railway etc.)
- npm / pnpm / yarn

#### Steps

1. Clone the repository

```bash
git clone https://github.com/dsw50250/projekt-dyplomowy.git
cd projekt-dyplomowy
```
2. Install dependencies
Bash
```bash
npm install
cd frontend && npm install && cd ..
```
3. Create .env from .env.exampleBash
```bash
cp .env.example .env
```
Fill in:
```bash

envDATABASE_URL="postgresql://postgres:password@localhost:5432/task_manager?schema=public"
JWT_SECRET=your-very-long-random-secret-here
PORT=3000
```
4. Initialize databaseBash
```bash
npx prisma generate
npx prisma db push   # or migrate dev
```

(Optional) Seed initial data
If you have a seed script:
```bash
npx prisma db seed
# or node prisma/seed.js (if exists)
```
5. Run the application
Backend + frontend in dev mode:
```bash
npm run dev   # assuming script in package.json runs both
```
Or separately:
```bash
node index.js          # backend (usually on port 3000)
cd frontend && npm run dev   # frontend (Next.js)
```

Authentication & Security

Passwords hashed with bcrypt (10 rounds)
JWT tokens (8h expiration) stored in httpOnly cookies (sameSite: strict) + fallback to localStorage
Protected routes via authenticateToken middleware
Role checks with requireRole(['admin', 'manager'])
Endpoints: /users/login, /users/register

Core Business Logic
The most important part is the automatic task assignment implemented in the task creation/update flow (likely in taskController.js):

Match task-required skills with user skills
Prefer users with lowest current workload
Update assignedToId and increment workload
Allow manual assignment (flag manuallyAssigned)
