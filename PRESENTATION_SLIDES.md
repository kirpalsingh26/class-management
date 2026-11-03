# 🎓 College Presentation: Class Management System

---

## 🖥️ Slide 1: Title Slide
- **Project Title:** Class Management System
- **Domain:** Web Development / Full-Stack MERN
- **Presented By:** Kirpal Singh
- **Roll Number:** 2421217
- **Course / Branch:** Information Technology (IT)
- **Tech Stack:** MongoDB, Express.js, React.js, Node.js, Tailwind CSS

---

## 🎯 Slide 2: Problem Statement & Motivation
- **Manual Overhead:** Traditional classroom management relies on manual attendance registers, scattered WhatsApp groups, and loose email attachments.
- **Data Fragmentation:** Teachers struggle to organize coursework, notes, and attendance across different classes and semesters.
- **Student Visibility:** Students lack a real-time, consolidated dashboard to monitor their attendance percentage against college exam eligibility criteria (75% threshold).
- **Solution:** A centralized, role-based web application that streamlines class administration, attendance tracking, coursework distribution, and notice broadcasting.

---

## 🎯 Slide 3: Objectives & Key Goals
1. **Role-Based Workspaces:** Distinct portals for Teachers (management) and Students (consumption).
2. **Classroom Administration:** Create and manage classes, subject codes, and student enrollment.
3. **Attendance Management:** Accurate daily attendance recording with duplicate prevention and percentage calculations.
4. **Coursework Distribution:** Upload assignments, notes, and project briefs with secure file attachments.
5. **Notice Board:** Broadcast timely announcements to targeted classes.
6. **Simplicity & Reliability:** Built with clean, beginner-friendly architecture that is easy to understand and maintain.

---

## 🏗️ Slide 4: System Architecture & Tech Stack
```text
┌────────────────────────────────────────────────────────┐
│                      FRONTEND                          │
│   React 18 + Vite + Tailwind CSS + React Router DOM    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST API (JWT)
┌──────────────────────────▼─────────────────────────────┐
│                      BACKEND                           │
│   Node.js + Express.js + Multer File Handler           │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼─────────────────────────────┐
│                      DATABASE                          │
│   MongoDB (Users, Classes, Attendance, Work, Notices)  │
└────────────────────────────────────────────────────────┘
```
- **Frontend:** React (Vite) with component-driven architecture and Tailwind CSS for natural styling.
- **Backend:** Express.js REST API structured into routes, controllers, and middleware.
- **Database:** MongoDB storing JSON documents with Mongoose schema validation.
- **Security:** Stateless JWT authentication and bcrypt password hashing.

---

## 👨‍🏫 Slide 5: Teacher Module & Capabilities
- **Dashboard:** At-a-glance summary cards showing Total Classes, Total Students, Assignments Created, and Recent Notices.
- **Class Management:**
  - Create, view, edit, and delete classes.
  - Search and enroll existing student accounts.
  - Remove students without deleting their user accounts.
- **Attendance Manager:**
  - Select class and date.
  - Single-click **"Mark All Present"** with individual Present / Absent toggles.
  - View historical attendance per date and correct past records.
- **Coursework Management:**
  - Publish Assignments, Classwork, Projects, and Notes.
  - Target specific classes (multi-class support).
  - Attach files (PDF, DOCX, PPTX, images up to 10 MB).
- **Announcements:** Post notices targeted to selected classes.

---

## 👨‍🎓 Slide 6: Student Module & Capabilities
- **Student Profile:** Displays Name (**Kirpal Singh**), Roll Number (**2421217**), and Course (**IT**).
- **Attendance Tracker:**
  - Real-time aggregate percentage: `(Present Classes / Total Classes Held) * 100`.
  - Visual color-coded progress bar (Green for ≥ 75%, Yellow for 65–74%, Red for < 65%).
  - Class-by-class attendance breakdown.
- **Assignments & Study Materials:**
  - View all coursework and syllabus notes assigned to enrolled classes.
  - One-click secure download for lecture attachments and worksheets.
  - Read-only viewing format to keep the student workflow simple and clean.
- **Notice Board:** Real-time updates and circulars from teachers.

---

## 🗄️ Slide 7: Database Design & Models
- **`User`:** `name`, `email`, `password` (hashed), `role` (`teacher` | `student`), `rollNumber`, `course`, `phone`.
- **`Class`:** `name`, `code`, `subject`, `description`, `teacherId` (ref: User), `enrolledStudents` (array of ref: User).
- **`Attendance`:** `classId`, `studentId`, `date` (`YYYY-MM-DD`), `status` (`present` | `absent`), `markedBy`.
  - *Unique Index:* `{ classId: 1, studentId: 1, date: 1 }` prevents duplicates.
- **`Work`:** `title`, `description`, `type`, `classIds` (array of ref: Class), `teacherId`, `dueDate`, `attachment`, `maxMarks`.
- **`Announcement`:** `title`, `message`, `classIds`, `teacherId`, timestamps.

---

## 🔐 Slide 8: Security & Privacy Implementation
1. **Stateless Authentication:**
   - JSON Web Tokens (JWT) signed with HMAC SHA-256.
   - Sent via standard `Authorization: Bearer <token>` header.
2. **Role-Based Authorization:**
   - Frontend: `ProtectedRoute` checks user role before rendering pages.
   - Backend: `authorize('teacher')` blocks students from administrative APIs (HTTP 403).
3. **Class Data Isolation:**
   - Students can only view classes, coursework, and notices they are enrolled in.
   - Enforced at database query level (`classIds: { $in: enrolledClassIds }`).
4. **Safe File Uploads:**
   - Multer checks file size (max 10 MB) and file extensions.
   - Files are stored outside public web roots; served through authenticated download endpoints.
5. **No Public Teacher Registration:**
   - Public registration route strictly assigns `role: 'student'`. Teacher accounts are created via seed or administrative setup.

---

## 📊 Slide 9: Attendance Calculation & Integrity
- **Formula:**
  $$\text{Percentage} = \left(\frac{\text{Present Count}}{\text{Total Sessions Held}}\right) \times 100$$
- **Upsert Mechanism:**
  - In `attendanceController.js`, `Attendance.findOneAndUpdate({ classId, studentId, date }, { status }, { upsert: true })` ensures that saving attendance multiple times for the same day updates the status rather than creating duplicate entries.
- **College Eligibility Guard:**
  - When attendance is $\ge 75\%$, student gets an **"Eligible for Exams"** status.
  - When attendance is $< 75\%$, a warning badge is highlighted on both the dashboard and attendance page.

---

## 🧪 Slide 10: Testing & Verification
- **Automated Integration Test Suite (`npm test`):**
  1. Teacher Login Authentication
  2. Student Login Authentication
  3. Class Creation (`ALGO-1060`)
  4. Student Enrollment into Class
  5. Attendance Recording & Past Correction (Deduplication verified)
  6. Student Attendance Percentage Retrieval
  7. Coursework Upload with File Attachment
  8. Enrolled Student File Download
  9. Unauthorized Student Class Isolation (HTTP 403 verified)
  10. Student Blocked from Teacher-Only Endpoints
  11. Student Forbidden from Marking Attendance
  12. Student Assignment Submission Handling
  13. Cross-Student Submission Privacy
  14. Teacher Grading & Feedback Persistence
  15. Teacher-to-Teacher Classroom Isolation
- **Result:** **15 / 15 Tests Passed (100% Pass Rate)**

---

## 💡 Slide 11: Demo Credentials (Ready for Live Demo)
- **Teacher Account:**
  - Email: `teacher@cms.dev`
  - Password: `password123`
  - Name: Prof. Rajesh Sharma
- **Student Account (Primary):**
  - Email: `kirpal@cms.dev`
  - Password: `password123`
  - Name: **Kirpal Singh** (Roll No: **2421217**, Course: **IT**)
- *One-Click Demo:* Both buttons are available directly on the login screen for instant demo during viva!

---

## 🚀 Slide 12: Conclusion & Future Scope
- **Conclusion:** Class Management System delivers a robust, secure, and user-friendly platform tailored to college needs without unnecessary enterprise bloat.
- **Future Enhancements:**
  - Push notifications for upcoming deadlines.
  - Timetable and lecture scheduling module.
  - Export attendance reports to Excel / PDF.
  - Parent portal with read-only attendance tracking.

---
**Thank You!**  
*Questions & Answers (Viva)*

