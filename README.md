# EduManage — Class Management System

> A simple, functional, and beginner-friendly web application built with the **MERN** stack (MongoDB, Express, React, Node.js) for managing classes, students, attendance, coursework, and announcements.

---

## 📌 Project Overview

**EduManage** is designed for colleges and schools where teachers can manage their classrooms and coursework efficiently while students have a dedicated portal to view their attendance, syllabus notes, assignments, and class notices.

### Key Roles:
1. **Teacher:**
   - Create, edit, and manage classes.
   - Enroll or remove students from classes.
   - Mark and correct daily attendance with duplicate prevention.
   - Upload assignments, classwork, projects, and study material (with attachments up to 10 MB).
   - Post class-targeted announcements and notice board updates.
   - Review and grade submitted student work.

2. **Student:**
   - Dedicated dashboard displaying student profile (**Kirpal Singh**, Roll: **2421217**, Course: **IT**).
   - Overall attendance percentage with automatic eligibility status (≥ 75%).
   - Class-by-class attendance history breakdown.
   - View assigned coursework and download lecture notes and attachments.
   - Read notices and announcements published by their teachers.

---

## 🛠️ Technology Stack

- **Frontend:**
  - **React 18** with **Vite** (fast build & hot module reloading)
  - **React Router DOM 7** (declarative client-side routing & role guards)
  - **Tailwind CSS v4** (clean, responsive, natural styling)
  - **Lucide React** (standard, lightweight icons)
  - **Axios** (HTTP client with JWT interceptor)

- **Backend:**
  - **Node.js** & **Express.js** (REST API)
  - **MongoDB** with **Mongoose ODM**
  - **JSON Web Tokens (JWT)** for stateless authentication
  - **bcryptjs** for 12-round password hashing
  - **Multer** for safe local file attachments

---

## 📂 Project Structure

```text
kirpal training project/
├── package.json               # Root scripts (run both client & server)
├── README.md                  # Complete documentation & viva guide
├── PRESENTATION_SLIDES.md     # Ready-made slide deck for presentation
│
├── client/                    # Frontend React application
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js         # Proxies /api to Express (port 5001)
│   └── src/
│       ├── App.jsx            # Main route configuration & role guards
│       ├── main.jsx           # React DOM root entry
│       ├── components/        # Reusable UI components
│       │   ├── Navbar.jsx     # Top navigation with user badges
│       │   ├── Sidebar.jsx    # Responsive sidebar
│       │   └── Modal.jsx      # Clean popup dialogs
│       ├── context/
│       │   └── AuthContext.jsx # Login, logout, and token state
│       ├── pages/             # Clean page views
│       │   ├── Login.jsx      # Login with quick 1-click demo buttons
│       │   ├── Register.jsx   # Student self-registration
│       │   ├── Dashboard.jsx  # Teacher & Student dashboards
│       │   ├── Classes.jsx    # Class list & creation
│       │   ├── ClassDetails.jsx # Enrolled students & roster
│       │   ├── Students.jsx   # Student directory & search
│       │   ├── Attendance.jsx # Attendance marking & date history
│       │   ├── StudentAttendance.jsx # Student attendance analytics
│       │   ├── Work.jsx       # Coursework listing & upload modal
│       │   ├── WorkDetails.jsx# Coursework details & downloads
│       │   └── Announcements.jsx # Notices & announcements
│       └── services/
│           └── api.js         # Axios instance with auth interceptor
│
└── server/                    # Backend Node.js & Express API
    ├── server.js              # Server entry point & port listener
    ├── app.js                 # Express middleware & route definitions
    ├── package.json
    ├── .env                   # Environment configuration
    ├── config/
    │   └── db.js              # MongoDB Mongoose connection
    ├── models/                # Mongoose database models
    │   ├── User.js            # User accounts (teachers & students)
    │   ├── Class.js           # Classrooms & student enrollment
    │   ├── Attendance.js      # Daily attendance with unique index
    │   ├── Work.js            # Coursework & attachments
    │   ├── Submission.js      # Student submissions & grading
    │   └── Announcement.js    # Notices & target classes
    ├── controllers/           # Business logic
    │   ├── authController.js
    │   ├── classController.js
    │   ├── studentController.js
    │   ├── attendanceController.js
    │   ├── workController.js
    │   └── announcementController.js
    ├── middleware/            # Security & upload middleware
    │   ├── auth.js            # JWT verification & role authorization
    │   └── upload.js          # Multer storage, size, & MIME filter
    ├── scripts/
    │   ├── seed.js            # Database seeder with demo accounts
    │   └── test-workflows.js  # 15 automated integration tests
    └── uploads/               # Safe local storage for attachments
        ├── work/
        └── submissions/
```

---

## 🚀 How to Run the Project

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally on port `27017` or via MongoDB Compass / Atlas)

### 2. Install Dependencies
Run the following from the root project folder:
```bash
npm run install:all
```
*(Or run `npm install` inside both `server/` and `client/` directories)*

### 3. Seed Demo Data
Populate the database with pre-configured classes, attendance, assignments, and demo accounts:
```bash
npm run seed
```

### 4. Start the Application
Start both the Express backend (`http://localhost:5001`) and Vite frontend (`http://localhost:5173`) simultaneously:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

### 5. Run Integration Tests
Verify all 15 core workflows and security isolation rules:
```bash
npm test
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher** | `teacher@cms.dev` | `password123` | Prof. Rajesh Sharma (Full teacher permissions) |
| **Student** | `kirpal@cms.dev` | `password123` | **Kirpal Singh**, Roll: **2421217**, Course: **IT** |
| **Student 2** | `aarav@cms.dev` | `password123` | Aarav Patel, Roll: CS2026-001, Course: CSE |

> 💡 **Viva Tip:** On the login screen (`/login`), click **"Teacher Demo"** or **"Student: Kirpal"** to auto-fill the credentials in one click!

---

## 🛡️ Security & Privacy Features

1. **Role-Based Access Control (RBAC):**
   - Protected routes in React redirect unauthorized users away from restricted pages.
   - Backend middleware (`protect`, `authorize('teacher')`) verifies the JWT role on every API call.
2. **Student Class Isolation:**
   - Students can only view coursework, attachments, and announcements for classes they are enrolled in.
   - Non-enrolled students attempting to access private work receive an HTTP `403 Forbidden`.
3. **Attendance Integrity:**
   - A compound unique index `{ classId: 1, studentId: 1, date: 1 }` prevents duplicate attendance records. Saving attendance updates existing records.
4. **Password Security:**
   - Passwords are salted and hashed using `bcryptjs` with a cost factor of 12.
   - Passwords are never sent back in API responses (`select: false`).
5. **Restricted Public Registration:**
   - Public registration (`/register`) is hard-coded to only create `student` accounts. Teacher accounts cannot be registered via public forms.

---

## 🎓 College Viva / Presentation Q&A

### Q1: Why did you choose MongoDB instead of a relational database like MySQL?
> **Answer:** MongoDB is a NoSQL document database that stores records as flexible JSON-like documents (BSON). It integrates smoothly with Node.js and JavaScript, allowing us to embed arrays of enrolled student IDs and class IDs directly without requiring heavy SQL join tables.

### Q2: How is user authentication handled?
> **Answer:** We use JSON Web Tokens (JWT). When the user logs in, the backend verifies their password using `bcrypt.compare()`. If valid, a signed JWT containing the user's ID is issued. The frontend stores this token and includes it in the `Authorization: Bearer <token>` header on every request.

### Q3: How is attendance percentage calculated?
> **Answer:** Using the formula:
> $$\text{Attendance Percentage} = \left(\frac{\text{Classes Present}}{\text{Total Classes Held}}\right) \times 100$$
> If attendance percentage is $\ge 75\%$, the system displays an "Eligible" green badge. If it drops below $75\%$, a warning is shown.

### Q4: How do you prevent duplicate attendance entries?
> **Answer:** We use two levels of prevention:
> 1. In Mongoose, we defined a compound unique index: `attendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true })`.
> 2. In the controller, we execute `findOneAndUpdate` with `{ upsert: true }`, which updates the existing record if already marked for that day.

### Q5: How do file attachments work?
> **Answer:** We use `multer` to handle `multipart/form-data`. Uploaded files are validated for size (max 10 MB) and extension (PDF, DOCX, PPTX, images). Files are stored on the server under `server/uploads/work/`, and their download route verifies that the requesting student is actively enrolled in the class before streaming the file.

