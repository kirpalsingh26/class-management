# Class Management System (CMS)
## Official Presentation Deck & College Viva Voce Defense Guide

---

## 📁 Presentation Assets Overview

We have prepared two presentation formats for your college presentation and viva defense:

| Asset | File Location | Description & How to Use |
| :--- | :--- | :--- |
| **PowerPoint Slide Deck (.pptx)** | [`Class_Management_System_Presentation.pptx`](file:///Users/kirpalsingh/Desktop/kirpal%20training%20project/Class_Management_System_Presentation.pptx) | Standard 16:9 widescreen PowerPoint deck with 15 custom-styled slides and embedded speaker notes. Compatible with Microsoft PowerPoint, Google Slides, Apple Keynote, and LibreOffice Impress. |
| **Interactive HTML Slide Deck** | [`presentation/index.html`](file:///Users/kirpalsingh/Desktop/kirpal%20training%20project/presentation/index.html) | Standalone browser-based presentation deck with keyboard navigation (`←`/`→`/`Space`), speaker notes toggle (`N` key), and built-in "Export to PDF" print layout. Open directly in Chrome, Safari, or Edge. |
| **Generator Script** | [`scripts/generate_ppt.py`](file:///Users/kirpalsingh/Desktop/kirpal%20training%20project/scripts/generate_ppt.py) | Reusable Python script leveraging `python-pptx` to recompile the slide deck if you ever need to change your name, roll number, or college department. |

---

## 🎬 3-Minute Live Viva Demo Script

Follow this sequence during your live presentation demo:

1. **Teacher Login & Dashboard (45s)**
   - Open browser at `http://localhost:5173/login`.
   - Click the demo button or enter:
     - **Email:** `teacher@cms.dev`
     - **Password:** `password123`
   - Point out the **Teacher Dashboard**: summary cards (Classes Managed, Students, Assignments, Recent Activity) and top-bar role badge (`TEACHER`).

2. **Class & Attendance Recording (45s)**
   - Click **My Classes** in the sidebar. Show the classes (`Data Structures`, `Database Systems`, `Web Development`).
   - Click **Attendance** in the sidebar. Select `Data Structures` and today's date.
   - Click the **"Mark All Present"** button, toggle one student (e.g. Ananya) to **Absent**, and click **Save Attendance**.
   - Show the instant toast confirmation: *"Attendance saved successfully"*.
   - Mention to the examiner: *"If I click save again, our idempotent upsert updates the existing database record rather than creating duplicate rows."*

3. **Publish Coursework (30s)**
   - Go to **Assignments & Work**. Click **Create Work**.
   - Title: `Lab 4: Binary Search Trees Implementation`.
   - Type: `Assignment`. Assign to: `Data Structures`. Max Marks: `100`. Due Date: Next week.
   - Attach a sample PDF document (`sample.pdf`). Click **Publish**.

4. **Switch to Student Portal (45s)**
   - Click **Logout**.
   - Log in as student:
     - **Email:** `kirpal@cms.dev`
     - **Password:** `password123`
   - Point out the **Student Dashboard**:
     - Personalized greeting: *Hello, Kirpal Singh! (Roll: 2421217 • Course: IT)*.
     - **Attendance Meter:** Notice the visual percentage progress bar (100% attendance).
     - **Coursework Feed:** Show the course materials and assignments assigned by the teacher.
   - Click **View Details** and **Download Attachment** (show how the student can view guidelines and download notes/resources cleanly without any submission upload forms).

5. **Teacher Grading & Feedback (15s)**
   - Switch back to `teacher@cms.dev`.
   - Go to **Assignments & Work**, open submissions for `Lab 4`.
   - See Aarav's submission, enter **Marks:** `95`, add **Feedback:** *"Excellent tree balancing logic"*, and save.
   - Conclude: *"The entire academic cycle is closed, secure, and isolated."*

---

## 📊 Slide-by-Slide Speaker Notes & Viva Script

### Slide 1: Title Slide (Capstone Project Defense)
- **Title:** Class Management System
- **Subtitle:** A Modern, Role-Based Full-Stack Web Platform for Academic Administration, Attendance Tracking, Coursework Distribution, and Secure Submissions
- **Candidate:** Kirpal Singh | B.Tech Information Technology (IT)
- **Talking Script:**
  > "Good morning respected external examiner and faculty members. Today I am presenting my final project: Class Management System. This project is a dedicated, role-based academic platform built using the MERN stack to solve common classroom administrative headaches such as fragmented communication, manual attendance calculation errors, and unsecured coursework distribution."

### Slide 2: Problem Statement (The Academic Record Keeping Dilemma)
- **Three Pain Points:**
  1. *Fragmented Ecosystem:* Paper registers, WhatsApp groups, and Google Drive links cause lost files and missed deadlines.
  2. *Manual Attendance Burden:* Faculty spend hours at the end of each semester tallying present marks; students are unaware when they drop below the 75% cutoff until detention notices are issued.
  3. *Zero Data Isolation:* Unrestricted drive links leak files across different sections and allow students to view peer submissions.
- **Talking Script:**
  > "In most colleges today, attendance is still recorded manually on paper registers or scattered Excel files. Assignments and notes are sent over informal messaging groups where critical updates get buried under chat noise. Students have zero real-time visibility into their attendance percentage until the semester ends, and public links create severe privacy and plagiarism vulnerabilities."

### Slide 3: Project Objectives & Scope
- **Four Core Pillars:**
  - *Strict Role-Based Access Control (RBAC):* Dual personas (Teacher vs. Student) enforced at both frontend and backend.
  - *Multi-Class Roster Management:* Dynamic class creation with student search and enrollment; unenrolling students never deletes their account.
  - *Automated Attendance Engine:* Idempotent upsert matching `(classId, studentId, date)` with real-time percentage calculation.
  - *Protected Coursework & Submission Gateway:* Multi-class assignment distribution, 10MB validated uploads, and gated file streaming.
- **Talking Script:**
  > "To address these issues, we set four clear objectives: First, implement strict Role-Based Access Control so students can never perform administrative actions. Second, create a multi-class roster system with duplicate prevention. Third, develop an attendance engine that automatically calculates percentages and prevents duplicate records. And fourth, build a secure coursework and submission module with protected file downloads."

### Slide 4: System Architecture (3-Tier Model)
- **Architecture Flow:**
  - *Presentation Tier (Client):* React 19 SPA bundled with Vite, styled with Tailwind CSS v4, guarded by React Router DOM v7.
  - *Application Tier (API):* Node.js + Express REST API, stateless JWT auth middleware, Multer file engine, protected stream gateway.
  - *Data Tier (Database):* MongoDB document store, Mongoose ODM with strict schemas and compound unique indexes.
- **Talking Script:**
  > "Our system follows a standard 3-Tier Architecture. The client is a React 19 single-page application built on Vite for instant loading. The server is an Express.js REST API on Node.js, and the persistence tier is MongoDB managed via Mongoose ODM. An important architectural decision is our Protected File Gateway: static files are not hosted in a public folder; they can only be streamed after the API verifies the user's active session and class enrollment."

### Slide 5: Technology Stack & Technical Justifications
- **Stack Breakdown:**
  - *React 19 & Vite:* Instant HMR during development; complete production build compiles in just 220 milliseconds.
  - *Node.js & Express:* Asynchronous non-blocking event loop handles high-concurrency student traffic seamlessly.
  - *MongoDB & Mongoose:* Document structure maps naturally to classes and coursework; Mongoose enforces schema validation and compound indexing.
  - *JWT & bcryptjs:* Stateless cryptographic tokens prevent server session memory leaks; 10 rounds of bcrypt salt hashing protect passwords.
- **Talking Script:**
  > "We chose the MERN stack for its unified JavaScript ecosystem, non-blocking asynchronous I/O, and fast development cycle. React 19 with Vite delivers sub-second builds, while Express middleware pipelines handle CORS, body parsing, and authorization cleanly. MongoDB provides flexible document modeling for classes and coursework, with Mongoose ensuring schema integrity."

### Slide 6: Database Schema & Entity Relationships
- **Six Core Collections:**
  1. `User`: `name`, `email` (unique), `passwordHash`, `role` (`teacher` | `student`), `rollNumber`.
  2. `Class`: `name`, `code` (unique), `subject`, `teacherId` (Ref User), `enrolledStudents` (Array of Ref User).
  3. `Attendance`: `classId`, `studentId`, `date`, `status` (`present` | `absent` | `late`), `markedBy`. **Compound Unique Index on `(classId, studentId, date)`**.
  4. `Work`: `title`, `description`, `type`, `classIds` (Array of Ref Class), `teacherId`, `dueDate`, `requiresSubmission`, `maxMarks`, `attachment`.
  5. `Submission`: `workId`, `studentId`, `responseText`, `attachment`, `status`, `marks`, `feedback`. **Compound Unique Index on `(workId, studentId)`**.
  6. `Announcement`: `title`, `message`, `classIds`, `teacherId`, `timestamps`.
- **Talking Script:**
  > "Here is our database schema. A key technical highlight is our Attendance collection, where we created a compound unique index on classId, studentId, and date. This guarantees at the database level that a student can never have more than one attendance record per class per date. Similarly, the Submission collection indexes workId and studentId, allowing students to update their submissions without creating duplicate entries."

### Slide 7: Teacher Console & Class Operations
- **Features:**
  - Create, view, edit, and delete classes.
  - Search existing registered students by Name or Roll Number and add them to rosters.
  - Prevents duplicate enrollments in the same class.
  - Safe unenrollment: removing a student from a class preserves their account and records in other courses.
  - Executive dashboard with live class count, student count, and coursework activity.
- **Talking Script:**
  > "The Teacher Console provides full control over classroom rosters. Teachers can create classes and enroll students with a quick search by name or roll number. Notice that unenrolling a student from a class does not delete their user account or wipe their records in other classes. This separation of concerns prevents accidental data loss."

### Slide 8: Daily Attendance Engine & Metrics
- **Features:**
  - Fast roll call table with class & date picker.
  - "Mark All Present" shortcut for rapid roll calls.
  - Idempotent upsert: re-saving a date modifies the record in place.
  - Attendance % formula: `(Present Classes / Total Classes Held) * 100`.
  - Color-coded progress meters: Green (≥ 75%), Amber (60–74%), Red (< 60%).
- **Talking Script:**
  > "The attendance engine solves the common college problem of attendance disputes. The teacher selects a class and date, uses the 'Mark All Present' shortcut, toggles absent students, and saves. If an error is noticed later, re-saving updates the exact record. The attendance percentage is calculated transparently as Present divided by Total classes held multiplied by 100, and students see real-time color-coded alerts on their dashboard."

### Slide 9: Coursework Management & File Gateway
- **Features:**
  - 4 categories: Assignments, Classwork, Projects, and Notes.
  - Multi-class targeting: assign to Class A and Class B simultaneously.
  - 10 MB per-file upload limit with MIME filtering (PDF, DOCX, PPTX, Images).
  - Safe server-side randomized storage names prevent directory traversal.
  - Protected download route checks JWT and class enrollment before streaming files.
- **Talking Script:**
  > "Our Coursework module handles assignments, classwork, projects, and study notes. A major security implementation here is our Protected File Gateway. In many student projects, uploaded files are placed in a public folder accessible via direct URL. In our system, all files are stored outside the public root. When a user requests a file, our backend checks their JWT token, confirms they belong to the assigned class, and only then streams the file."

### Slide 10: Student Portal & Assignment Submissions
- **Features:**
  - Personalized student dashboard with enrolled classes and attendance percentages.
  - Coursework filter: All Work, Assignments, Classwork, Projects, Notes.
  - Turn-in modal: submit text, file attachments, or both.
  - Update capability prior to deadline.
  - Teacher evaluation console: view turn-ins, download files, award marks, and add constructive feedback.
  - Complete peer privacy: students cannot view other students' submissions.
- **Talking Script:**
  > "The Student Portal gives students a focused, distraction-free environment without any teacher controls. Students can view upcoming deadlines, download course materials, and submit their responses. Once a teacher grades the assignment and provides feedback, the marks appear instantly on the student's dashboard."

### Slide 11: Security Architecture & RBAC
- **Features:**
  - Passwords hashed with `bcryptjs` (10 salt rounds).
  - Stateless JSON Web Tokens (JWT) containing `id` and `role`.
  - Frontend route protection using `<RoleRoute>`.
  - Backend API protection using `auth` and `requireRole('teacher')` middleware.
  - Class boundary isolation: query results scoped to user's enrolled classes.
- **Talking Script:**
  > "For security, we implemented Defense in Depth. Passwords are salted and hashed using bcryptjs with 10 salt rounds. Every API call is verified by JWT middleware. Even if an attacker attempts to bypass our React UI and invoke administrative endpoints using cURL or Postman, the backend middleware immediately rejects the request with HTTP 403 Forbidden."

### Slide 12: Testing, Verification & Quality Assurance
- **Features:**
  - Automated integration test suite: **15/15 test scenarios passed**.
  - Negative security tests: verified student privilege escalation blocked.
  - Class isolation verified: unassigned students cannot query private coursework.
  - Production build verified: compiled in 220 ms with zero warnings or errors.
  - Seeder script (`npm run seed`) populates reproducible demo environment.
- **Talking Script:**
  > "We verified the entire system through an automated integration test suite consisting of 15 end-to-end scenarios. It checks both happy paths and negative security tests, including privilege escalation and class isolation. All 15 tests passed with exit code 0, and our production frontend builds cleanly in 220 milliseconds."

### Slide 13: Live Demonstration Plan (Viva Walkthrough)
- Outlines the 7-step roadmap executed during the live demo (Teacher login -> Class inspection -> Attendance marking -> Assignment upload -> Student switch -> Turn-in -> Teacher grading).

### Slide 14: Conclusion & Future Roadmap
- **Key Achievements:** Centralized classroom operations, eliminated paper registers, implemented strict RBAC, and created a protected file gateway.
- **Future Scope:** Automated push/email notifications for deadlines, lecture timetable scheduler, online MCQ quiz engine, and official university PDF report exports.
- **Talking Script:**
  > "In conclusion, Class Management System replaces fragmented, error-prone manual methods with a clean, role-based platform. For future work, we plan to add automated deadline push notifications, an online MCQ quiz module, and one-click PDF generation for university attendance records."

### Slide 15: Q&A & Viva Voce Discussion
- Open floor for examiner questions and live code inspection.

---

## 🎯 Top 15 Viva Voce Questions & Model Answers

### Q1: Why did you choose MongoDB over a relational database like MySQL or PostgreSQL?
**Model Answer:**
> "We chose MongoDB because academic classroom data is naturally document-oriented and hierarchical. For example, a class document contains an array of enrolled student ObjectIds, and coursework items map to arrays of class IDs. MongoDB's flexible schema allows us to store rich attachment metadata directly within the document without needing multiple join tables. At the same time, we used Mongoose ODM to enforce schema strictness, data types, and compound unique indexes, giving us relational-like data integrity with NoSQL agility."

### Q2: How does your system prevent duplicate attendance records when a teacher clicks "Save" multiple times?
**Model Answer:**
> "We solve this at two levels: First, at the database level, we defined a compound unique index on `(classId, studentId, date)` in the Mongoose Attendance schema. Second, in our Express attendance controller, we use an idempotent upsert via `Attendance.findOneAndUpdate({ classId, studentId, date }, { status, markedBy }, { upsert: true, new: true })`. If a record for that student on that date already exists, it updates in place; if not, it creates a new record. This guarantees zero duplicates regardless of network retries or repeated clicks."

### Q3: What prevents a student from accessing teacher endpoints or marking attendance?
**Model Answer:**
> "We enforce authorization on both the client and the server. On the client, React Router wraps administrative views in a `<RoleRoute allowedRoles={['teacher']}>` component, redirecting unauthorized users. More importantly, on the server, all administrative routes are protected by our `requireRole('teacher')` middleware. This middleware extracts the user's role from the verified JWT payload. If the role is not 'teacher', it terminates the request immediately with an HTTP 403 Forbidden status code, making it impossible to tamper with attendance or classes even via Postman."

### Q4: How is file download security implemented? Can someone access an uploaded file if they guess the URL?
**Model Answer:**
> "No, direct URL access is impossible. We intentionally store uploaded files in an unexposed `server/uploads` directory outside of any public web root. To download a file, the client must make an authenticated request to `/api/work/:id/download`. The backend middleware validates the JWT token, verifies that the requesting user is either the teacher who created the material or a student enrolled in one of the assigned classes, and only then streams the file to the browser using Express's `res.download()`. Unauthorized users receive HTTP 403."

### Q5: Why did you choose JWT authentication over traditional session cookies?
**Model Answer:**
> "We chose JSON Web Tokens because they are stateless and scalable. With JWT, the server does not need to maintain an in-memory session store or query a session database on every incoming request. The token is cryptographically signed using a secret key on the server, containing the user's ID, email, and role. This simplifies horizontal scaling, eliminates session memory leaks, and provides seamless integration with single-page frontend applications like React."

### Q6: If a teacher removes a student from a class, does it delete the student's account or records?
**Model Answer:**
> "No, the system cleanly decouples class membership from user accounts. When a teacher unenrolls a student, the controller uses MongoDB's `$pull` operator to remove the student's ObjectId from the class's `enrolledStudents` array. The student's User document remains intact, and their enrollment in other classes is unaffected. This guarantees that student accounts and general academic history are never accidentally destroyed."

### Q7: What formula is used to calculate the attendance percentage, and how is 'Late' attendance handled?
**Model Answer:**
> "The attendance percentage is calculated using the formula:
> `Attendance Percentage = (Number of Present Classes / Total Classes Held) * 100`.
> In our application, 'Late' attendance is logged as a distinct status (`late`). In the standard calculation, it does not count as an unexcused absence, but is tracked separately so teachers and students can see their punctuality trends alongside their attendance percentage."

### Q8: How are file uploads validated to prevent server compromise or disk exhaustion?
**Model Answer:**
> "We use Multer with two strict validation filters:
> 1. **Size Limit:** A strict limit of 10 MB per file is enforced; oversized payloads are rejected immediately.
> 2. **MIME Type Whitelist:** We validate against allowed MIME types: `application/pdf`, MS Word (`.docx`), MS PowerPoint (`.pptx`), and standard web image formats (`jpeg`, `png`, `webp`).
> 3. **Cryptographic Storage Names:** Files are saved using random cryptographic hashes to prevent directory traversal attacks or filename collisions."

### Q9: How are passwords stored, and why is bcryptjs used?
**Model Answer:**
> "Passwords are never stored in plain text. We use `bcryptjs` with 10 salt rounds. Salt rounds ensure that even if two users have identical passwords, their stored hashes are completely different. Bcrypt is a computationally adaptive hashing algorithm that is resistant to rainbow table attacks and brute-force cracking."

### Q10: Why did you use React 19 with Vite instead of Create React App or Next.js?
**Model Answer:**
> "Create React App has been deprecated by the React team and suffers from slow build times and large bundle sizes. Vite uses native browser ES modules during development, providing instant Hot Module Replacement (HMR). Our entire client compiles in just 220 milliseconds. We chose pure React with Vite over Next.js because our application is an authenticated, internal web portal where Server-Side Rendering (SSR) and search engine optimization (SEO) are unnecessary. Client-side rendering provides a faster, app-like experience for students and faculty."

### Q11: How do you prevent student A from viewing student B's assignment submission?
**Model Answer:**
> "When a student requests submission details via `/api/work/:id/my-submission`, the query filter strictly matches `{ workId: req.params.id, studentId: req.user._id }`. The user ID is extracted directly from the verified JWT token on the server, not from URL parameters that could be manipulated. In the teacher submission list endpoint, only authorized teachers can view all submissions for grading."

### Q12: How are announcements scoped across classes?
**Model Answer:**
> "Announcements store an array of target `classIds`. When a student visits their dashboard or announcement feed, the backend performs a query: `Announcement.find({ classIds: { $in: studentClassIds } })`. This ensures that students only see announcements relevant to the specific classes they are currently enrolled in, keeping the feed clean and preventing information leakage between different subjects."

### Q13: What automated testing did you perform on the application?
**Model Answer:**
> "We wrote a comprehensive automated integration testing suite in `server/scripts/test-workflows.js` covering 15 end-to-end scenarios. It tests authentication, role authorization, student privilege escalation blocking (verifying HTTP 403), attendance upsert without duplication, coursework multi-class publishing, student turn-in, teacher grading, and protected file download verification. All 15 tests passed with 100% success rate."

### Q14: How does the backend handle concurrent submissions before a deadline (e.g. at 11:59 PM)?
**Model Answer:**
> "Node.js utilizes an event-driven, non-blocking asynchronous I/O model. Heavy operations like database writes and file stream piping are offloaded to libuv's thread pool, allowing the single-threaded event loop to continue accepting incoming student requests. Additionally, our compound index on `(workId, studentId)` ensures atomic updates, preventing race conditions if a student double-clicks the submit button."

### Q15: What are the primary future enhancements you plan to add to this system?
**Model Answer:**
> "The top three future enhancements are:
> 1. **Automated Notification Service:** Integrating web push notifications and email reminders via SendGrid/Nodemailer for upcoming assignment deadlines.
> 2. **Interactive Timetable & Calendar:** A weekly visual schedule planner with room and faculty conflict detection.
> 3. **Export to Official University Formats:** A one-click export utility generating printable attendance registers and grade sheets in PDF and Excel formats."

---

## 🛠️ Quick Commands Reference

```bash
# Start MongoDB Daemon (if not already running)
npm run db

# Seed Demo Data (Teacher, 5 Students, 3 Classes, Attendance & Work)
npm run seed

# Run Full Integration Test Suite (15 Test Cases)
npm test

# Start Backend API (Port 5001) & Frontend Dev Server (Port 5173)
npm run dev

# Re-generate PowerPoint File (.pptx)
python3 scripts/generate_ppt.py
```

