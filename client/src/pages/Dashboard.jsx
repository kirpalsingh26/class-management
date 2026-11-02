import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BookOpen,
  Users,
  FileText,
  CalendarCheck,
  Bell,
  ArrowRight,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isTeacher } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleDownload = async (workId, filename) => {
    try {
      const res = await api.get(`/work/${workId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'attachment');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download file attachment.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center max-w-lg mx-auto mt-10">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-red-800">Connection Error</h3>
        <p className="text-sm text-red-600 mt-1">{error || 'Unable to retrieve dashboard information.'}</p>
      </div>
    );
  }

  if (isTeacher) {
    const { summary, classes, recentSubmissions, recentAnnouncements } = data;

    return (
      <div className="space-y-6">
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Teacher Dashboard • Manage your classes, student attendance, and assignments.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/attendance"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
            >
              Mark Attendance
            </Link>
            <Link
              to="/work"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-sm font-medium px-4 py-2 rounded-md transition"
            >
              Create Assignment
            </Link>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Classes Managed</p>
              <h3 className="text-2xl font-bold text-gray-800">{summary?.totalClasses || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800">{summary?.totalStudents || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Work Items</p>
              <h3 className="text-2xl font-bold text-gray-800">{summary?.totalWorkItems || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Attendance Entries</p>
              <h3 className="text-2xl font-bold text-gray-800">{summary?.totalAttendanceMarked || 0}</h3>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">My Classes</h2>
              <Link to="/classes" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {classes && classes.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {classes.map((cls) => (
                  <div key={cls._id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{cls.name}</h4>
                      <p className="text-xs text-gray-500">
                        Code: <span className="font-mono text-gray-700">{cls.code}</span> • Subject: {cls.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                        {cls.studentCount || 0} Students
                      </span>
                      <Link
                        to={`/classes/${cls._id}`}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center">No classes created yet. Click "My Classes" to add one.</p>
            )}
          </div>

          
          <div className="space-y-6">
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Recent Turn-ins</h2>
                <Link to="/work" className="text-xs text-blue-600 font-semibold hover:underline">
                  View Work
                </Link>
              </div>

              {recentSubmissions && recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {recentSubmissions.slice(0, 5).map((sub) => (
                    <div key={sub._id} className="p-3 bg-gray-50 rounded-md border border-gray-100 text-xs">
                      <p className="font-semibold text-gray-800">{sub.studentId?.name || 'Student'}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5 truncate">{sub.workId?.title}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-gray-400 text-[10px]">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                        <span
                          className={`font-semibold ${
                            sub.status === 'graded' ? 'text-green-600' : 'text-blue-600'
                          }`}
                        >
                          {sub.status === 'graded' ? `Graded: ${sub.marks} pts` : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-4 text-center">No student submissions yet.</p>
              )}
            </div>

            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Notice Board</h2>
                <Link to="/announcements" className="text-xs text-blue-600 font-semibold hover:underline">
                  Post Notice
                </Link>
              </div>

              {recentAnnouncements && recentAnnouncements.length > 0 ? (
                <div className="space-y-3">
                  {recentAnnouncements.slice(0, 3).map((ann) => (
                    <div key={ann._id} className="border-l-3 border-blue-500 pl-3 py-1">
                      <h4 className="text-xs font-bold text-gray-800">{ann.title}</h4>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{ann.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-2 text-center">No announcements posted.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, classes, upcomingWork, recentAnnouncements } = data;
  const overallPercentage = summary?.overallAttendancePercentage ?? 100;

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Hello, {user?.name}! 🎓
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Student Portal • Roll Number: <span className="font-semibold text-gray-700">{user?.rollNumber || '2421217'}</span>
          {user?.course ? <span> • Course: <strong className="text-blue-700 font-semibold">{user.course}</strong></span> : ''}
        </p>
      </div>

      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Overall Attendance Rate</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold text-gray-900">{overallPercentage}%</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  overallPercentage >= 75
                    ? 'bg-green-100 text-green-800'
                    : overallPercentage >= 65
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {overallPercentage >= 75 ? 'Safe (≥ 75%)' : 'Attendance Shortage Warning (< 75%)'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formula: (Present Classes / Total Classes Held) × 100
            </p>
          </div>
          <Link
            to="/my-attendance"
            className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View Full Attendance Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        
        <div className="w-full bg-gray-200 h-2.5 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercentage >= 75
                ? 'bg-green-500'
                : overallPercentage >= 65
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">My Enrolled Classes</h2>
            <Link to="/classes" className="text-xs text-blue-600 font-semibold hover:underline">
              All Classes
            </Link>
          </div>

          {classes && classes.length > 0 ? (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div key={cls._id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{cls.name}</h4>
                    <p className="text-xs text-gray-500">{cls.subject} • Teacher: {cls.teacherName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {cls.attendancePercentage ?? 100}% Attended
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-6 text-center">You are not enrolled in any classes yet.</p>
          )}
        </div>

        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Assignments & Coursework</h2>
            <Link to="/work" className="text-xs text-blue-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {upcomingWork && upcomingWork.length > 0 ? (
            <div className="space-y-3">
              {upcomingWork.map((item) => (
                <div key={item._id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-800 mt-1">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No deadline'}
                      </p>
                    </div>

                    <Link
                      to={`/work/${item._id}`}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded transition shrink-0"
                    >
                      View Details
                    </Link>
                  </div>

                  {item.attachment && (
                    <button
                      type="button"
                      onClick={() => handleDownload(item._id, item.attachment.originalName)}
                      className="mt-2 text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download {item.attachment.originalName}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-6 text-center">No pending assignments!</p>
          )}
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Class Announcements</h2>
          <Link to="/announcements" className="text-xs text-blue-600 font-semibold hover:underline">
            View All
          </Link>
        </div>

        {recentAnnouncements && recentAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAnnouncements.map((ann) => (
              <div key={ann._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-800">{ann.title}</h4>
                  <span className="text-[10px] text-gray-400">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{ann.message}</p>
                <p className="text-[11px] text-blue-600 mt-2 font-medium">By: {ann.teacherId?.name || 'Instructor'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">No announcements for your classes.</p>
        )}
      </div>
    </div>
  );
}
