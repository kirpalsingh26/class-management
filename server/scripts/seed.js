import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Work from '../models/Work.js';
import Submission from '../models/Submission.js';
import Announcement from '../models/Announcement.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Work.deleteMany({});
    await Submission.deleteMany({});
    await Announcement.deleteMany({});

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@cms.dev',
      password: 'password123',
      role: 'admin',
      department: 'Administration',
    });

    const teacher = await User.create({
      name: 'Prof. Rajesh Sharma',
      email: 'teacher@cms.dev',
      password: 'password123',
      role: 'teacher',
      department: 'Information Technology',
      phone: '+91 98765 43210',
    });

    const teacher2 = await User.create({
      name: 'Dr. Priya Mehta',
      email: 'priya@cms.dev',
      password: 'password123',
      role: 'teacher',
      department: 'Computer Science',
      phone: '+91 98765 11223',
    });

    const studentData = [
      {
        name: 'Kirpal Singh',
        email: 'kirpal@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421217',
        course: 'IT',
        phone: '+91 98765 24212',
      },
      {
        name: 'Aarav Patel',
        email: 'aarav@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421218',
        course: 'IT',
        phone: '+91 98111 11111',
      },
      {
        name: 'Ananya Gupta',
        email: 'ananya@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421219',
        course: 'IT',
        phone: '+91 98222 22222',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421220',
        course: 'IT',
        phone: '+91 98333 33333',
      },
      {
        name: 'Diya Sen',
        email: 'diya@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421221',
        course: 'IT',
        phone: '+91 98444 44444',
      },
      {
        name: 'Kabir Singh',
        email: 'kabir@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421222',
        course: 'IT',
        phone: '+91 98555 55555',
      },
      {
        name: 'Simran Kaur',
        email: 'simran@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421223',
        course: 'IT',
        phone: '+91 98666 66666',
      },
      {
        name: 'Harman Preet',
        email: 'harman@cms.dev',
        password: 'password123',
        role: 'student',
        rollNumber: '2421224',
        course: 'IT',
        phone: '+91 98777 77777',
      },
    ];

    const students = await User.create(studentData);
    const [kirpal, aarav, ananya, rohan, diya, kabir, simran, harman] = students;
    const allStudentIds = students.map((s) => s._id);

    const classDefs = [
      {
        name: 'Computer Networks',
        code: 'CN-301',
        subject: 'Information Technology',
        description: 'OSI model, TCP/IP protocol suite, subnetting, IPv4/IPv6 addressing, and network routing algorithms.',
        teacherId: teacher._id,
        enrolledStudents: allStudentIds,
      },
      {
        name: 'Database Management Systems',
        code: 'DBMS-302',
        subject: 'Information Technology',
        description: 'Relational data modeling, ER diagrams, normal forms 1NF to BCNF, SQL query execution, and ACID transactions.',
        teacherId: teacher._id,
        enrolledStudents: allStudentIds,
      },
      {
        name: 'Web Applications Development',
        code: 'WEB-303',
        subject: 'Information Technology',
        description: 'Modern full-stack web architectures, REST APIs, React components, Node.js runtime, and secure authentication.',
        teacherId: teacher._id,
        enrolledStudents: allStudentIds,
      },
      {
        name: 'Operating Systems',
        code: 'OS-304',
        subject: 'Information Technology',
        description: 'Process scheduling algorithms, multithreading, CPU synchronization, deadlocks, and virtual memory management.',
        teacherId: teacher._id,
        enrolledStudents: [kirpal._id, aarav._id, ananya._id, rohan._id, diya._id, simran._id],
      },
      {
        name: 'Data Structures & Algorithms',
        code: 'DSA-305',
        subject: 'Information Technology',
        description: 'Arrays, linked lists, trees, graphs, sorting techniques, dynamic programming, and asymptotic time complexity.',
        teacherId: teacher._id,
        enrolledStudents: allStudentIds,
      },
      {
        name: 'Software Engineering & Agile',
        code: 'SE-306',
        subject: 'Information Technology',
        description: 'SDLC methodologies, Agile Scrum sprints, UML modeling, software testing lifecycle, and design patterns.',
        teacherId: teacher._id,
        enrolledStudents: [kirpal._id, kabir._id, simran._id, harman._id, diya._id, rohan._id],
      },
      {
        name: 'Artificial Intelligence & Machine Learning',
        code: 'AI-307',
        subject: 'Information Technology',
        description: 'Supervised and unsupervised learning, decision trees, neural network basics, regression models, and heuristic search.',
        teacherId: teacher2._id,
        enrolledStudents: [kirpal._id, aarav._id, ananya._id, kabir._id, harman._id],
      },
      {
        name: 'Cloud Computing & DevOps',
        code: 'CC-308',
        subject: 'Information Technology',
        description: 'Virtualization, public cloud infrastructure, containerization with Docker, CI/CD pipelines, and microservices.',
        teacherId: teacher2._id,
        enrolledStudents: [kirpal._id, aarav._id, rohan._id, simran._id, harman._id],
      },
      {
        name: 'Cyber Security & Cryptography',
        code: 'CS-309',
        subject: 'Information Technology',
        description: 'Symmetric and asymmetric cryptography, hashing algorithms, firewalls, network vulnerability assessment, and web security.',
        teacherId: teacher._id,
        enrolledStudents: allStudentIds,
      },
    ];

    const classes = await Class.create(classDefs);

    const dates = [
      '2026-10-14',
      '2026-10-16',
      '2026-10-19',
      '2026-10-21',
      '2026-10-23',
      '2026-10-26',
      '2026-10-28',
      '2026-10-30',
      '2026-11-02',
    ];

    const attendanceRecords = [];

    for (const cls of classes) {
      for (const d of dates) {
        for (const sId of cls.enrolledStudents) {
          const isKirpal = sId.toString() === kirpal._id.toString();
          const presentChance = isKirpal ? 0.84 : 0.78;
          const status = Math.random() < presentChance ? 'present' : 'absent';

          attendanceRecords.push({
            classId: cls._id,
            studentId: sId,
            date: d,
            status,
            markedBy: teacher._id,
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);

    const workItems = [
      {
        title: 'Assignment 1: TCP Handshake & Wireshark Packet Inspection',
        description: 'Capture a 3-way TCP handshake in Wireshark. Identify SYN, SYN-ACK, and ACK flags and write a brief analysis of sequence numbers.',
        type: 'assignment',
        classIds: [classes[0]._id],
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        requiresSubmission: true,
        maxMarks: 50,
      },
      {
        title: 'Class Notes: IPv4 Subnetting & CIDR Calculation Guide',
        description: 'Reference notes explaining network masks, slash notation, broadcast addresses, and formula for calculating usable hosts.',
        type: 'notes',
        classIds: [classes[0]._id],
        teacherId: teacher._id,
        requiresSubmission: false,
      },
      {
        title: 'Project 1: E-Commerce Relational Schema Design in 3NF',
        description: 'Design a normalized 3NF database schema for an e-commerce platform including customers, products, orders, and payment records.',
        type: 'project',
        classIds: [classes[1]._id],
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        requiresSubmission: true,
        maxMarks: 100,
      },
      {
        title: 'Classwork: SQL Joins and Correlated Subqueries',
        description: 'Practice writing complex SELECT queries using INNER JOIN, LEFT OUTER JOIN, GROUP BY, and HAVING clauses.',
        type: 'classwork',
        classIds: [classes[1]._id],
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        requiresSubmission: true,
        maxMarks: 20,
      },
      {
        title: 'Notes: React Hooks, State Management & Lifecycle',
        description: 'Reference documentation on useState, useEffect, useCallback, and Context API with code patterns.',
        type: 'notes',
        classIds: [classes[2]._id],
        teacherId: teacher._id,
        requiresSubmission: false,
      },
      {
        title: 'Assignment 2: CPU Scheduling Algorithms Simulation',
        description: 'Implement and compare FCFS, SJF, and Round Robin scheduling algorithms. Calculate average waiting and turnaround time.',
        type: 'assignment',
        classIds: [classes[3]._id],
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        requiresSubmission: true,
        maxMarks: 50,
      },
      {
        title: 'Project 2: Graph Pathfinding & Dijkstra Implementation',
        description: 'Construct an adjacency list representation of a weighted graph and implement Dijkstra shortest path algorithm in JavaScript or C++.',
        type: 'project',
        classIds: [classes[4]._id],
        teacherId: teacher._id,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        requiresSubmission: true,
        maxMarks: 100,
      },
      {
        title: 'Class Notes: Asymmetric Cryptography & RSA Public Key Protocol',
        description: 'Explanatory notes detailing prime factorization, modular exponentiation, public-private key generation, and digital signatures.',
        type: 'notes',
        classIds: [classes[8]._id],
        teacherId: teacher._id,
        requiresSubmission: false,
      },
    ];

    const createdWorks = await Work.create(workItems);

    await Submission.create({
      workId: createdWorks[0]._id,
      studentId: kirpal._id,
      responseText: 'Captured the 3-way TCP handshake in Wireshark for httpbin.org. The SYN packet initialized seq 0, SYN-ACK acknowledged with ack 1, and connection completed with final ACK seq 1.',
      status: 'graded',
      marks: 49,
      feedback: 'Excellent Wireshark trace and very clear explanation of sequence numbers. Perfect submission Kirpal!',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    await Announcement.create([
      {
        title: 'Mid-Semester Examination Schedule Announced',
        message: 'Mid-term exams will commence from the second week of this month. Please ensure your syllabus assignments and lab records are submitted.',
        classIds: classes.map((c) => c._id),
        teacherId: teacher._id,
      },
      {
        title: 'Lab Practical Timings & Machine Allocations',
        message: 'Web Development and Database practical sessions will be held in IT Lab 3. Keep your lab records updated.',
        classIds: [classes[1]._id, classes[2]._id],
        teacherId: teacher._id,
      },
      {
        title: 'Guest Lecture on Cloud Native Architectures',
        message: 'A technical session on Docker containers and Kubernetes microservices will be held this Friday in the college seminar hall.',
        classIds: [classes[7]._id],
        teacherId: teacher._id,
      },
    ]);

    console.log('=============================================');
    console.log('Seed completed successfully!');
    console.log('Admin Login:   admin@cms.dev   / password123');
    console.log('Teacher Login: teacher@cms.dev / password123 (Prof. Rajesh Sharma)');
    console.log('               priya@cms.dev   / password123 (Dr. Priya Mehta)');
    console.log('Student Login: kirpal@cms.dev  / password123 (Kirpal Singh, Roll: 2421217, IT)');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDatabase();
