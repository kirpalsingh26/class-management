import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import app from '../app.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Work from '../models/Work.js';
import Submission from '../models/Submission.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

let server;
let baseUrl;

async function request(method, endpoint, { token, body, isFormData, filePath, fileField } = {}) {
  const url = new URL(endpoint, baseUrl);

  let headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let requestBody = null;

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  } else if (isFormData) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;

    const parts = [];
    for (const [key, val] of Object.entries(body || {})) {
      parts.push(
        `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
      );
    }

    if (filePath && fileField) {
      const fileName = path.basename(filePath);
      const fileData = fs.readFileSync(filePath);
      const pre = `--${boundary}\r\nContent-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
      const post = `\r\n--${boundary}--\r\n`;
      requestBody = Buffer.concat([Buffer.from(parts.join('') + pre), fileData, Buffer.from(post)]);
    } else {
      parts.push(`--${boundary}--\r\n`);
      requestBody = Buffer.from(parts.join(''));
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: requestBody,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    data,
  };
}

async function runTests() {
  console.log('--- Starting CMS Verification Tests ---');
  await connectDB();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    console.log('\n[1] Testing Teacher Login...');
    const teacherLoginRes = await request('POST', '/api/auth/login', {
      body: { email: 'teacher@cms.dev', password: 'password123' },
    });
    if (teacherLoginRes.status !== 200 || !teacherLoginRes.data.data.token) {
      throw new Error(`Teacher login failed: ${JSON.stringify(teacherLoginRes.data)}`);
    }
    const teacherToken = teacherLoginRes.data.data.token;
    console.log('✓ Teacher login passed');

    console.log('\n[2] Testing Student Login...');
    const studentLoginRes = await request('POST', '/api/auth/login', {
      body: { email: 'aarav@cms.dev', password: 'password123' },
    });
    if (studentLoginRes.status !== 200 || !studentLoginRes.data.data.token) {
      throw new Error(`Student login failed: ${JSON.stringify(studentLoginRes.data)}`);
    }
    const studentToken = studentLoginRes.data.data.token;
    const studentUser = studentLoginRes.data.data.user;
    console.log('✓ Student login passed');

    console.log('\n[3] Testing Teacher Creating a Class...');
    const createClassRes = await request('POST', '/api/classes', {
      token: teacherToken,
      body: {
        name: 'Algorithms & Data Structures',
        code: `ALGO-${Date.now().toString().slice(-4)}`,
        subject: 'Computer Science',
        description: 'Sorting, dynamic programming, and graph theory.',
      },
    });
    if (createClassRes.status !== 201) {
      throw new Error(`Create class failed: ${JSON.stringify(createClassRes.data)}`);
    }
    const testClass = createClassRes.data.data.classItem;
    console.log(`✓ Class created: ${testClass.code} - ${testClass.name}`);

    console.log('\n[4] Testing Enrolling Student into Class...');
    const enrollRes = await request('POST', `/api/classes/${testClass._id}/students`, {
      token: teacherToken,
      body: { studentId: studentUser._id },
    });
    if (enrollRes.status !== 200) {
      throw new Error(`Enroll student failed: ${JSON.stringify(enrollRes.data)}`);
    }
    console.log('✓ Student successfully enrolled into class');

    console.log('\n[5] Testing Attendance Recording & Correction...');
    const testDate = '2026-10-29';
    const markRes = await request('POST', '/api/attendance', {
      token: teacherToken,
      body: {
        classId: testClass._id,
        date: testDate,
        records: [{ studentId: studentUser._id, status: 'absent' }],
      },
    });
    if (markRes.status !== 200) {
      throw new Error(`Mark attendance failed: ${JSON.stringify(markRes.data)}`);
    }

    const correctRes = await request('POST', '/api/attendance', {
      token: teacherToken,
      body: {
        classId: testClass._id,
        date: testDate,
        records: [{ studentId: studentUser._id, status: 'present' }],
      },
    });
    if (correctRes.status !== 200) {
      throw new Error(`Correct attendance failed: ${JSON.stringify(correctRes.data)}`);
    }

    const attRecord = await Attendance.findOne({
      classId: testClass._id,
      studentId: studentUser._id,
      date: testDate,
    });
    if (attRecord.status !== 'present') {
      throw new Error(`Attendance not updated to present: ${attRecord.status}`);
    }
    console.log('✓ Attendance marked and corrected successfully (single record maintained)');

    console.log('\n[6] Testing Student Viewing Their Attendance...');
    const myAttRes = await request('GET', '/api/attendance/my', {
      token: studentToken,
    });
    if (myAttRes.status !== 200 || !myAttRes.data.data.classes) {
      throw new Error(`Get my attendance failed: ${JSON.stringify(myAttRes.data)}`);
    }
    console.log(`✓ Student attendance retrieved: overall ${myAttRes.data.data.overall.percentage}%`);

    console.log('\n[7] Testing Teacher Creating Assignment with Attachment...');
    const tempFilePath = path.join(process.cwd(), 'temp-test-file.pdf');
    fs.writeFileSync(tempFilePath, '%PDF-1.4 dummy test pdf document content');

    const createWorkRes = await request('POST', '/api/work', {
      token: teacherToken,
      isFormData: true,
      filePath: tempFilePath,
      fileField: 'file',
      body: {
        title: 'Dynamic Programming Homework',
        description: 'Solve the 0/1 Knapsack problem.',
        type: 'assignment',
        classIds: JSON.stringify([testClass._id]),
        dueDate: '2026-11-05',
        requiresSubmission: 'true',
        maxMarks: '50',
      },
    });

    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    if (createWorkRes.status !== 201) {
      throw new Error(`Create work failed: ${JSON.stringify(createWorkRes.data)}`);
    }
    const testWork = createWorkRes.data.data.work;
    console.log(`✓ Assignment created with attachment: ${testWork.title}`);

    console.log('\n[8] Testing Student Downloading Assignment Attachment...');
    const downloadRes = await request('GET', `/api/work/${testWork._id}/download`, {
      token: studentToken,
    });
    if (downloadRes.status !== 200) {
      throw new Error(`Download failed: ${downloadRes.status}`);
    }
    console.log('✓ Enrolled student successfully downloaded attachment');

    console.log('\n[9] Testing Unauthorized Student Isolation...');
    const kabirLoginRes = await request('POST', '/api/auth/login', {
      body: { email: 'kabir@cms.dev', password: 'password123' },
    });
    const kabirToken = kabirLoginRes.data.data.token;

    const unauthorizedWorkRes = await request('GET', `/api/work/${testWork._id}`, {
      token: kabirToken,
    });
    if (unauthorizedWorkRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unauthorized student, got ${unauthorizedWorkRes.status}`);
    }

    const unauthorizedDownloadRes = await request('GET', `/api/work/${testWork._id}/download`, {
      token: kabirToken,
    });
    if (unauthorizedDownloadRes.status !== 403) {
      throw new Error(`Expected 403 for unauthorized download, got ${unauthorizedDownloadRes.status}`);
    }
    console.log('✓ Class isolation verified: unenrolled student received 403 Forbidden');

    console.log('\n[10] Testing Student Blocked from Teacher-Only APIs...');
    const teacherOnlyRes = await request('POST', '/api/classes', {
      token: studentToken,
      body: { name: 'Hacked Class', code: 'HACK101', subject: 'Hacking' },
    });
    if (teacherOnlyRes.status !== 403) {
      throw new Error(`Student was able to call teacher API! Status: ${teacherOnlyRes.status}`);
    }
    console.log('✓ Student blocked with 403 from teacher-only route');

    console.log('\n[11] Testing Student Cannot Mark Attendance...');
    const studentMarkRes = await request('POST', '/api/attendance', {
      token: studentToken,
      body: {
        classId: testClass._id,
        date: '2026-10-29',
        records: [{ studentId: studentUser._id, status: 'present' }],
      },
    });
    if (studentMarkRes.status !== 403) {
      throw new Error(`Student was able to mark attendance! Status: ${studentMarkRes.status}`);
    }
    console.log('✓ Student forbidden from marking attendance');

    console.log('\n[12] Testing Student Assignment Submission...');
    const submitRes = await request('POST', `/api/work/${testWork._id}/submit`, {
      token: studentToken,
      body: {
        responseText: 'Here is my O(nW) bottom-up dynamic programming table implementation.',
      },
    });
    if (submitRes.status !== 201) {
      throw new Error(`Submission failed: ${JSON.stringify(submitRes.data)}`);
    }
    const submissionId = submitRes.data.data.submission._id;
    console.log('✓ Student successfully submitted assignment');

    console.log('\n[13] Testing Cross-Student Submission Isolation...');
    const otherStudentRes = await request('PUT', `/api/work/submissions/${submissionId}/grade`, {
      token: kabirToken,
      body: { marks: 50 },
    });
    if (otherStudentRes.status !== 403) {
      throw new Error(`Cross-student exploit detected! Status: ${otherStudentRes.status}`);
    }
    console.log('✓ Submission protected from other students');

    console.log('\n[14] Testing Teacher Grading Submission...');
    const gradeRes = await request('PUT', `/api/work/submissions/${submissionId}/grade`, {
      token: teacherToken,
      body: {
        marks: 49,
        feedback: 'Flawless DP transition equation and space optimization.',
      },
    });
    if (gradeRes.status !== 200 || gradeRes.data.data.submission.marks !== 49) {
      throw new Error(`Grading failed: ${JSON.stringify(gradeRes.data)}`);
    }
    console.log('✓ Teacher graded submission with 49 marks and feedback');

    console.log('\n[15] Testing Teacher-to-Teacher Isolation...');
    const secondTeacher = await User.create({
      name: 'Prof. Anirudh Mehta',
      email: `teacher2_${Date.now()}@cms.dev`,
      password: 'password123',
      role: 'teacher',
    });
    const teacher2LoginRes = await request('POST', '/api/auth/login', {
      body: { email: secondTeacher.email, password: 'password123' },
    });
    const teacher2Token = teacher2LoginRes.data.data.token;

    const crossTeacherRes = await request('DELETE', `/api/classes/${testClass._id}`, {
      token: teacher2Token,
    });
    if (crossTeacherRes.status !== 403) {
      throw new Error(`Another teacher was able to delete class! Status: ${crossTeacherRes.status}`);
    }

    const crossTeacherGradeRes = await request('PUT', `/api/work/submissions/${submissionId}/grade`, {
      token: teacher2Token,
      body: { marks: 0 },
    });
    if (crossTeacherGradeRes.status !== 403) {
      throw new Error(`Another teacher was able to grade! Status: ${crossTeacherGradeRes.status}`);
    }
    console.log('✓ Teacher isolation verified: unauthorized teacher receives 403');

    await request('DELETE', `/api/classes/${testClass._id}`, { token: teacherToken });
    await User.findByIdAndDelete(secondTeacher._id);

    console.log('\n=============================================');
    console.log('ALL 15 INTEGRATION TEST SCENARIOS PASSED! ✓');
    console.log('=============================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();

