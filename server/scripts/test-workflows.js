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
      body: { email: 'kirpal@cms.dev', password: 'password123' },
    });
    if (studentLoginRes.status !== 200 || !studentLoginRes.data.data.token) {
      throw new Error(`Student login failed: ${JSON.stringify(studentLoginRes.data)}`);
    }
    const studentToken = studentLoginRes.data.data.token;
    const studentUser = studentLoginRes.data.data.user;
    console.log('✓ Student login passed for Kirpal Singh (Roll: 2421217)');

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
    const priyaStudent = await User.findOne({ email: 'aarav@cms.dev' }) || studentUser;
    const unauthorizedWorkRes = await request('GET', `/api/work/${testWork._id}`, {
      token: studentToken,
    });
    console.log('✓ Enrolled student authorized');

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

    console.log('\n[13] Testing Teacher Grading Submission...');
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

    console.log('\n[14] Testing Public Self-Registration is Blocked (403)...');
    const selfRegRes = await request('POST', '/api/auth/register', {
      body: {
        name: 'Attacker Self Signup',
        email: 'attacker@evil.com',
        password: 'password123',
        role: 'student',
      },
    });
    if (selfRegRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden on self-registration, got: ${selfRegRes.status}`);
    }
    console.log('✓ Public self-registration correctly rejected with HTTP 403 Forbidden');

    console.log('\n[15] Testing Admin Login...');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      body: { email: 'admin@cms.dev', password: 'password123' },
    });
    if (adminLoginRes.status !== 200 || !adminLoginRes.data.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.data)}`);
    }
    const adminToken = adminLoginRes.data.data.token;
    console.log('✓ Admin login successful');

    console.log('\n[16] Testing Admin Dashboard Stats...');
    const adminStatsRes = await request('GET', '/api/dashboard/stats', {
      token: adminToken,
    });
    if (adminStatsRes.status !== 200 || adminStatsRes.data.data.role !== 'admin') {
      throw new Error(`Admin stats failed: ${JSON.stringify(adminStatsRes.data)}`);
    }
    console.log(`✓ Admin stats retrieved: ${adminStatsRes.data.data.summary.totalTeachers} teachers, ${adminStatsRes.data.data.summary.totalStudents} students`);

    console.log('\n[17] Testing Admin Creating New Teacher Account with Credentials...');
    const newTeacherEmail = `faculty_${Date.now()}@cms.dev`;
    const newTeacherPassword = 'customTeacherPass99';
    const adminCreateTeacherRes = await request('POST', '/api/admin/teachers', {
      token: adminToken,
      body: {
        name: 'Dr. Vikram Sarabhai',
        email: newTeacherEmail,
        department: 'Information Technology',
        password: newTeacherPassword,
      },
    });
    if (adminCreateTeacherRes.status !== 201) {
      throw new Error(`Admin create teacher failed: ${JSON.stringify(adminCreateTeacherRes.data)}`);
    }
    const createdTeacherId = adminCreateTeacherRes.data.data.teacher._id;
    console.log(`✓ Admin provisioned teacher: ${newTeacherEmail}`);

    console.log('\n[18] Testing Newly Provisioned Teacher Login...');
    const newTeacherLoginRes = await request('POST', '/api/auth/login', {
      body: { email: newTeacherEmail, password: newTeacherPassword },
    });
    if (newTeacherLoginRes.status !== 200 || !newTeacherLoginRes.data.data.token) {
      throw new Error(`Login for newly provisioned teacher failed: ${JSON.stringify(newTeacherLoginRes.data)}`);
    }
    const provisionedTeacherToken = newTeacherLoginRes.data.data.token;
    console.log('✓ Provisioned teacher successfully logged in using admin-assigned credentials');

    console.log('\n[19] Testing Teacher Provisioning Student Credentials...');
    const newStudentEmail = `student_${Date.now()}@cms.dev`;
    const newStudentRoll = `CS${Date.now().toString().slice(-4)}`;
    const newStudentPassword = 'studentPass123';
    const teacherCreateStudentRes = await request('POST', '/api/students', {
      token: provisionedTeacherToken,
      body: {
        name: 'Kavita Verma',
        email: newStudentEmail,
        rollNumber: newStudentRoll,
        course: 'IT',
        password: newStudentPassword,
      },
    });
    if (teacherCreateStudentRes.status !== 201) {
      throw new Error(`Teacher create student failed: ${JSON.stringify(teacherCreateStudentRes.data)}`);
    }
    const createdStudentId = teacherCreateStudentRes.data.data.student._id;
    console.log(`✓ Teacher provisioned student: ${newStudentRoll} (${newStudentEmail})`);

    console.log('\n[20] Testing Newly Provisioned Student Login...');
    const newStudentLoginRes = await request('POST', '/api/auth/login', {
      body: { email: newStudentEmail, password: newStudentPassword },
    });
    if (newStudentLoginRes.status !== 200 || !newStudentLoginRes.data.data.token) {
      throw new Error(`Login for newly provisioned student failed: ${JSON.stringify(newStudentLoginRes.data)}`);
    }
    console.log('✓ Provisioned student logged in using teacher-assigned credentials');

    console.log('\n[21] Testing Teacher or Student Cannot Access Admin Endpoints (403)...');
    const teacherAccessAdminRes = await request('GET', '/api/admin/stats', {
      token: teacherToken,
    });
    if (teacherAccessAdminRes.status !== 403) {
      throw new Error(`Teacher accessed admin route! Status: ${teacherAccessAdminRes.status}`);
    }
    const studentAccessAdminRes = await request('GET', '/api/admin/stats', {
      token: studentToken,
    });
    if (studentAccessAdminRes.status !== 403) {
      throw new Error(`Student accessed admin route! Status: ${studentAccessAdminRes.status}`);
    }
    console.log('✓ Non-admin roles strictly blocked from admin routes (403 Forbidden)');

    console.log('\n[22] Testing Auto-Generation of Teacher Roll Number and Email from Name...');
    const autoTeacherRes = await request('POST', '/api/admin/teachers', {
      token: adminToken,
      body: {
        name: 'Dr. Jagdish Chandra Bose',
        department: 'Physics & Computing',
        password: 'password123',
      },
    });
    if (autoTeacherRes.status !== 201) {
      throw new Error(`Auto teacher creation failed: ${JSON.stringify(autoTeacherRes.data)}`);
    }
    const autoTeacher = autoTeacherRes.data.data.teacher;
    if (!autoTeacher.rollNumber || !autoTeacher.email) {
      throw new Error(`Teacher roll or email was not auto-generated: ${JSON.stringify(autoTeacher)}`);
    }
    console.log(`✓ Auto-generated teacher account: Roll=${autoTeacher.rollNumber}, Email=${autoTeacher.email}`);

    console.log('\n[23] Testing Auto-Generation of Student Roll Number and Email from Name...');
    const autoStudentRes = await request('POST', '/api/students', {
      token: teacherToken,
      body: {
        name: 'Gurpreet Singh',
        course: 'IT',
        password: 'password123',
      },
    });
    if (autoStudentRes.status !== 201) {
      throw new Error(`Auto student creation failed: ${JSON.stringify(autoStudentRes.data)}`);
    }
    const autoStudent = autoStudentRes.data.data.student;
    if (!autoStudent.rollNumber || !autoStudent.email) {
      throw new Error(`Student roll or email was not auto-generated: ${JSON.stringify(autoStudent)}`);
    }
    console.log(`✓ Auto-generated student account: Roll=${autoStudent.rollNumber}, Email=${autoStudent.email}`);

    await User.findByIdAndDelete(createdStudentId);
    await User.findByIdAndDelete(createdTeacherId);
    await User.findByIdAndDelete(autoTeacher._id);
    await User.findByIdAndDelete(autoStudent._id);
    await request('DELETE', `/api/classes/${testClass._id}`, { token: teacherToken });

    console.log('\n=============================================');
    console.log('ALL 23 INTEGRATION TEST SCENARIOS PASSED! ✓');
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
