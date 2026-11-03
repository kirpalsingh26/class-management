import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  KeyRound,
  CheckCircle,
  Copy,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [provisionNotice, setProvisionNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [showModalPassword, setShowModalPassword] = useState(true);
  const [copiedPasswordId, setCopiedPasswordId] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/teachers');
      setTeachers(res.data.data.teachers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setDepartment('Information Technology');
    setPhone('');
    setPassword('password123');
    setError('');
    setShowModalPassword(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTeacher(t);
    setName(t.name);
    setEmail(t.email);
    setDepartment(t.department || 'Information Technology');
    setPhone(t.phone || '');
    setPassword(t.initialPassword || 'password123');
    setError('');
    setShowModalPassword(true);
    setIsModalOpen(true);
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const activePassword = password.trim() || 'password123';
      if (editingTeacher) {
        const payload = { name, email, department, phone };
        if (password.trim()) payload.password = password.trim();
        await api.put(`/admin/teachers/${editingTeacher._id}`, payload);
        setProvisionNotice({
          name,
          email,
          password: activePassword,
          action: 'updated',
        });
      } else {
        await api.post('/admin/teachers', {
          name,
          email,
          department,
          phone,
          password: activePassword,
        });
        setProvisionNotice({
          name,
          email,
          password: activePassword,
          action: 'created',
        });
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save teacher account');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!provisionNotice) return;
    const text = `Faculty Login Credentials:\nName: ${provisionNotice.name}\nEmail: ${provisionNotice.email}\nPassword: ${provisionNotice.password}\nPortal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPassword = (pass, id) => {
    navigator.clipboard.writeText(pass);
    setCopiedPasswordId(id);
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !showAllPasswords,
    }));
  };

  const isPasswordVisible = (id) => {
    if (visiblePasswords[id] !== undefined) {
      return visiblePasswords[id];
    }
    return showAllPasswords;
  };

  const handleDeleteTeacher = async (id, teacherName) => {
    if (!window.confirm(`Are you sure you want to delete ${teacherName}'s account?`)) return;

    try {
      await api.delete(`/admin/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete teacher account');
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Faculty & Teacher Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Provision teacher accounts, assign departments, and manage faculty login credentials with visible passwords.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition ${
              showAllPasswords
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAllPasswords ? 'Mask Passwords' : 'Show All Passwords'}
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            Add New Teacher
          </button>
        </div>
      </div>

      {provisionNotice && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-900">
                Teacher Account {provisionNotice.action === 'created' ? 'Provisioned Successfully' : 'Credentials Updated'}!
              </p>
              <p className="text-xs text-green-800 mt-0.5">
                Share these credentials with <strong>{provisionNotice.name}</strong>:
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

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name, email, department..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-gray-500 font-semibold hidden sm:block">
          Total Faculty: <strong className="text-gray-800">{teachers.length}</strong>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Faculty Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Login Password</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Classes</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((teacher) => {
                  const visible = isPasswordVisible(teacher._id);
                  const pass = teacher.initialPassword || 'password123';

                  return (
                    <tr key={teacher._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {teacher.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono">
                        {teacher.email}
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
                            onClick={() => togglePasswordVisibility(teacher._id)}
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
                            onClick={() => handleCopyPassword(pass, teacher._id)}
                            className="p-1 text-gray-400 hover:text-green-600 rounded transition"
                            title="Copy password"
                          >
                            {copiedPasswordId === teacher._id ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-[11px] border border-purple-200">
                          {teacher.department || 'Information Technology'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {teacher.classes && teacher.classes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.map((cls) => (
                              <span
                                key={cls._id}
                                className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                              >
                                {cls.code}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">No classes assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800">
                        {teacher.studentCount || 0}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(teacher)}
                          title="Edit / Reset Credentials"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(teacher._id, teacher.name)}
                          title="Delete Faculty Account"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">
            {searchTerm ? 'No teachers found matching your search.' : 'No faculty accounts created yet.'}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? `Edit / Reset Credentials: ${editingTeacher.name}` : 'Provision New Teacher Account'}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Kumar"
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
              placeholder="e.g. ramesh@cms.dev"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Information Technology"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 00000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              {editingTeacher ? 'Reset / Set Password' : 'Initial Password'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showModalPassword ? 'text' : 'password'}
                required={!editingTeacher}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingTeacher ? 'Enter new password to reset' : 'Initial password for teacher'}
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
            {editingTeacher
              ? 'Updating the password will immediately update the teacher login credentials.'
              : 'As administrator, you are setting these login credentials to provide directly to the faculty member.'}
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
              {saving ? 'Saving...' : editingTeacher ? 'Update Credentials' : 'Create Teacher Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
