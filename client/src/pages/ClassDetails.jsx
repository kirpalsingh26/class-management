import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Users,
  UserPlus,
  Trash2,
  CalendarCheck,
  FileText,
  Search,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function ClassDetails() {
  const { id } = useParams();
  const { isTeacher, isAdmin } = useAuth();
  const canManage = isTeacher || isAdmin;

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState({ type: '', text: '' });

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${id}`);
      setClassData(res.data.data.classItem);
    } catch (err) {
      console.error(err);
      setError('Failed to load class details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const handleOpenEnrollModal = async () => {
    setIsEnrollModalOpen(true);
    setEnrollMessage({ type: '', text: '' });
    try {
      const res = await api.get('/students');
      setAvailableStudents(res.data.data.students || []);
    } catch (err) {
      console.error('Failed to load student list:', err);
    }
  };

  const handleEnrollStudent = async (studentId) => {
    setEnrolling(true);
    setEnrollMessage({ type: '', text: '' });

    try {
      await api.post(`/classes/${id}/students`, { studentId });
      setEnrollMessage({ type: 'success', text: 'Student enrolled successfully!' });
      fetchClassDetails();
    } catch (err) {
      setEnrollMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to enroll student.',
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this class? (Their account and other records will not be deleted)`)) {
      return;
    }

    try {
      await api.delete(`/classes/${id}/students/${studentId}`);
      fetchClassDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-red-800">Error</h3>
        <p className="text-sm text-red-600 mt-1">{error || 'Class not found.'}</p>
        <Link to="/classes" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:underline">
          ← Back to classes
        </Link>
      </div>
    );
  }

  const enrolled = classData.enrolledStudents || [];
  const filteredStudents = enrolled.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term)
    );
  });

  const unenrolledCandidates = availableStudents.filter(
    (s) => !enrolled.some((en) => en._id === s._id)
  ).filter((s) => {
    const term = studentSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <Link to="/classes" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all classes
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {classData.code}
            </span>
            <span className="text-xs text-gray-500">• {classData.subject}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{classData.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{classData.description || 'No description provided.'}</p>
          <p className="text-xs text-gray-400 mt-2">
            Faculty: <span className="font-semibold text-gray-700">{classData.teacherId?.name || 'Instructor'}</span>
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/attendance?classId=${classData._id}`}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-md transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Mark Attendance
            </Link>
            <button
              type="button"
              onClick={handleOpenEnrollModal}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3.5 py-2 rounded-md transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Enroll Student
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-bold text-gray-800">
              Enrolled Students ({enrolled.length})
            </h3>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or roll no..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-[11px] border-b border-gray-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  {canManage && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
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
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(student._id, student.name)}
                          className="text-red-600 hover:text-red-800 font-medium hover:underline text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">
            {searchTerm ? 'No students match your search.' : 'No students enrolled in this class yet.'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Student into Class"
      >
        {enrollMessage.text && (
          <div
            className={`mb-4 p-3 rounded-md text-xs font-medium ${
              enrollMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {enrollMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Select an existing registered student account to add them to this class roster.
          </p>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search candidate students..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto divide-y divide-gray-100">
            {unenrolledCandidates.length > 0 ? (
              unenrolledCandidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 text-xs"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{candidate.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      {candidate.rollNumber ? `Roll: ${candidate.rollNumber} • ` : ''}
                      {candidate.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={enrolling}
                    onClick={() => handleEnrollStudent(candidate._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-xs text-gray-400">
                {studentSearch ? 'No matching students.' : 'All registered students are already enrolled!'}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
