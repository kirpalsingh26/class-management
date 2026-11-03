import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Users,
  UserPlus,
  Search,
  BookOpen,
  CheckCircle,
  Copy,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState('IT');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [provisionNotice, setProvisionNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [copiedPasswordId, setCopiedPasswordId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClassFilter) params.classId = selectedClassFilter;
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/students', { params }),
        api.get('/classes'),
      ]);
      setStudents(studentsRes.data.data.students || []);
      setClasses(classesRes.data.data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClassFilter]);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setRollNumber('');
    setCourse('IT');
    setPassword('password123');
    setError('');
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const activePassword = password.trim() || 'password123';
      await api.post('/students', {
        name,
        email,
        rollNumber,
        course,
        password: activePassword,
      });
      setProvisionNotice({
        name,
        email,
        rollNumber,
        password: activePassword,
      });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setRollNumber('');
      setCourse('IT');
      setPassword('password123');
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!provisionNotice) return;
    const text = `Student Login Credentials:\nName: ${provisionNotice.name}\nRoll: ${provisionNotice.rollNumber}\nEmail: ${provisionNotice.email}\nPassword: ${provisionNotice.password}\nPortal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySinglePassword = (pass, id) => {
    navigator.clipboard.writeText(pass);
    setCopiedPasswordId(id);
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };

  const togglePasswordVisibility = (id) => {
    const current = isPasswordVisible(id);
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !current,
    }));
  };

  const isPasswordVisible = (id) => {
    if (visiblePasswords[id] !== undefined) {
      return visiblePasswords[id];
    }
    return showAllPasswords;
  };

  const handleToggleShowAll = () => {
    const nextState = !showAllPasswords;
    setShowAllPasswords(nextState);
    setVisiblePasswords({});
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse registered student accounts, enroll students, and manage student login passwords.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleToggleShowAll}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition ${
              showAllPasswords
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAllPasswords ? 'Hide Passwords' : 'Show All Passwords'}
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {provisionNotice && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-900">
                Student Account Enrolled & Provisioned!
              </p>
              <p className="text-xs text-green-800 mt-0.5">
                Provide these login credentials to <strong>{provisionNotice.name}</strong> (Roll: {provisionNotice.rollNumber}):
              </p>
              <div className="flex flex-wrap gap-2 mt-2 font-mono text-xs text-gray-800 bg-white px-3 py-1.5 rounded border border-green-200">
                <span>Email: <strong>{provisionNotice.email}</strong></span>
                <span>•</span>
                <span>Password: <strong className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{provisionNotice.password}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded flex items-center gap-1 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Credentials'}
            </button>
            <button
              type="button"
              onClick={() => setProvisionNotice(null)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, roll no, email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Class:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Login Password</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Enrolled Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => {
                  const visible = isPasswordVisible(student._id);
                  const pass = student.initialPassword || 'password123';

                  return (
                    <tr key={student._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                        {student.rollNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {student.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span
                            className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition ${
                              visible
                                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            }`}
                          >
                            {visible ? pass : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(student._id)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition"
                            title={visible ? 'Hide password' : 'Show password'}
                          >
                            {visible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopySinglePassword(pass, student._id)}
                            className="p-1 text-gray-400 hover:text-green-600 rounded transition"
                            title="Copy password"
                          >
                            {copiedPasswordId === student._id ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-[11px]">
                          {student.course || 'IT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono">
                        {student.email}
                      </td>
                      <td className="py-3 px-4">
                        {student.enrolledClasses && student.enrolledClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.enrolledClasses.map((cls) => (
                              <span
                                key={cls._id}
                                className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                              >
                                {cls.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">
            {searchTerm || selectedClassFilter
              ? 'No students found matching your filters.'
              : 'No students enrolled yet. Click "Add Student" to register one.'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision & Enroll New Student"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@cms.dev"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 2421218"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Course / Department
            </label>
            <input
              type="text"
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. IT, CSE, ECE"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showModalPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial login password"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowModalPassword(!showModalPassword)}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition"
                title={showModalPassword ? 'Hide password' : 'Show password'}
              >
                {showModalPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
            As a faculty member, you are assigning these login credentials directly to the student. The student will use this email and password to log in.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
