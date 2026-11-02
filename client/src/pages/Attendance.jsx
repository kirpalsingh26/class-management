import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Save,
  Users,
  History,
  AlertCircle,
} from 'lucide-react';

export default function Attendance() {
  const [searchParams] = useSearchParams();
  const initialClassId = searchParams.get('classId') || '';
  const todayStr = new Date().toISOString().split('T')[0];

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [records, setRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('mark');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        const classList = res.data.data.classes || [];
        setClasses(classList);
        if (!selectedClassId && classList.length > 0) {
          setSelectedClassId(classList[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const fetchAttendance = async (preserveMessage = false) => {
    if (!selectedClassId || !selectedDate) return;
    try {
      setLoading(true);
      if (!preserveMessage) {
        setMessage({ type: '', text: '' });
      }
      const res = await api.get(`/attendance/class/${selectedClassId}`, {
        params: { date: selectedDate },
      });
      const data = res.data.data;
      setRecords(data.records || []);
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load attendance records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(false);
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) =>
      prev.map((rec) => (rec._id === studentId ? { ...rec, status } : rec))
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((rec) => ({ ...rec, status: 'present' })));
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedDate) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        classId: selectedClassId,
        date: selectedDate,
        records: records.map((r) => ({
          studentId: r._id,
          status: r.status || 'present',
        })),
      };

      await api.post('/attendance', payload);
      setMessage({
        type: 'success',
        text: `Attendance saved successfully for ${selectedDate}!`,
      });
      await fetchAttendance(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save attendance.',
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record daily attendance, modify past dates, and view class attendance history.
        </p>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Select Class:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setMessage({ type: '', text: '' });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Attendance Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setMessage({ type: '', text: '' });
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md self-start md:self-end">
          <button
            type="button"
            onClick={() => setActiveTab('mark')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === 'mark'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mark Daily Roll Call
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Class History Log
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-md text-xs font-medium ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'mark' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">
                Total Enrolled: {records.length}
              </span>
              <span className="text-xs text-green-600 font-semibold">• Present: {presentCount}</span>
              <span className="text-xs text-red-600 font-semibold">• Absent: {absentCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded text-xs font-semibold transition"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || records.length === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((student) => {
                    const status = student.status || 'present';
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-mono font-medium text-gray-800">
                          {student.rollNumber || '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {student.email}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'present')}
                              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                status === 'present'
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'absent')}
                              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                status === 'absent'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">
              No students enrolled in this class. Visit "My Classes" to enroll students first.
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Past Attendance Sessions</h3>

          {history && history.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {history.map((h, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{h.date}</span>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      Present: <strong className="text-green-600">{h.present ?? h.presentCount ?? 0}</strong> • Absent:{' '}
                      <strong className="text-red-600">{h.absent ?? h.absentCount ?? 0}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(h.date);
                      setActiveTab('mark');
                    }}
                    className="text-blue-600 font-medium hover:underline text-xs"
                  >
                    Edit This Day
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-6">No historical attendance records for this class yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
