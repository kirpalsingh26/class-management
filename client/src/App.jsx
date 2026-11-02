import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import StudentAttendance from './pages/StudentAttendance';
import Work from './pages/Work';
import WorkDetails from './pages/WorkDetails';
import Announcements from './pages/Announcements';
import NotFound from './pages/NotFound';

function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, title, teacherOnly = false, studentOnly = false }) {
  const { isAuthenticated, isTeacher, isStudent, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (teacherOnly && !isTeacher) {
    return <Navigate to="/dashboard" replace />;
  }

  if (studentOnly && !isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout title={title}>{children}</AppLayout>;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute title="Dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute title="My Classes">
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id"
            element={
              <ProtectedRoute title="Class Details">
                <ClassDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work"
            element={
              <ProtectedRoute title="Assignments & Work">
                <Work />
              </ProtectedRoute>
            }
          />
          <Route
            path="/work/:id"
            element={
              <ProtectedRoute title="Work Details">
                <WorkDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements"
            element={
              <ProtectedRoute title="Announcements">
                <Announcements />
              </ProtectedRoute>
            }
          />

          
          <Route
            path="/students"
            element={
              <ProtectedRoute title="Students Directory" teacherOnly={true}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute title="Attendance Management" teacherOnly={true}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute title="My Attendance" studentOnly={true}>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />

          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
