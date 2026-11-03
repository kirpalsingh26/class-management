import { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarCheck, CheckCircle, XCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/attendance/my');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load your attendance record.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-red-800">Error</h3>
        <p className="text-sm text-red-600 mt-1">{error || 'Unable to load attendance details.'}</p>
      </div>
    );
  }

  const { overall, classes } = data;
  const percentage = overall?.percentage ?? 100;

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance Record</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your aggregate attendance percentage and class-by-class session history.
        </p>
      </div>

      
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
              Aggregate Attendance Rate
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                {percentage}%
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold ${
                  percentage >= 75
                    ? 'bg-green-100 text-green-800'
                    : percentage >= 65
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {percentage >= 75
                  ? 'Eligible for Exams (≥ 75%)'
                  : percentage >= 65
                  ? 'Warning Zone (< 75%)'
                  : 'Critical Shortage (< 65%)'}
              </span>
            </div>

            
            <div className="w-full max-w-md bg-gray-200 h-3 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentage >= 75
                    ? 'bg-green-500'
                    : percentage >= 65
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formula: ({overall?.present ?? overall?.attended ?? 0} Present / {overall?.totalHeld ?? 0} Total Classes Held) × 100
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500">Classes Held</p>
              <p className="text-lg font-bold text-gray-800">{overall?.totalHeld || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-xs text-green-700">Attended</p>
              <p className="text-lg font-bold text-green-800">{overall?.present ?? overall?.attended ?? 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-md">
              <p className="text-xs text-red-700">Absences</p>
              <p className="text-lg font-bold text-red-800">{overall?.absent ?? overall?.absences ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Course Breakdown</h2>
        {classes && classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls._id || cls.classId}
                className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {cls.code || cls.classCode}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 mt-1">{cls.name || cls.className}</h3>
                    <p className="text-xs text-gray-500">{cls.subject} • {cls.teacher || cls.teacherName || 'Instructor'}</p>
                  </div>
                  <span
                    className={`text-sm font-extrabold ${
                      cls.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {cls.percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cls.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, cls.percentage)}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Held: <strong>{cls.totalHeld}</strong></span>
                  <span>Present: <strong className="text-green-600">{cls.present ?? cls.attended ?? 0}</strong></span>
                  <span>Absent: <strong className="text-red-600">{cls.absent ?? cls.absences ?? 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-6 text-center bg-white rounded-lg border border-gray-200">
            No class attendance records found.
          </p>
        )}
      </div>
    </div>
  );
}
