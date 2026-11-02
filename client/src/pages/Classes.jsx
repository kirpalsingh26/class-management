import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import { BookOpen, Plus, Users, Edit, Trash2, Search, ArrowRight } from 'lucide-react';

export default function Classes() {
  const { isTeacher } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/classes');
      setClasses(res.data.data.classes || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setName('');
    setCode('');
    setSubject('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingClass(cls);
    setName(cls.name);
    setCode(cls.code);
    setSubject(cls.subject);
    setDescription(cls.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      const payload = { name, code, subject, description };
      if (editingClass) {
        await api.put(`/classes/${editingClass._id}`, payload);
      } else {
        await api.post('/classes', payload);
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete class "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    }
  };

  const filteredClasses = classes.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.subject.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isTeacher ? 'My Classes' : 'Enrolled Classes'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isTeacher
              ? 'Create and manage classrooms, view enrolled students, and assign work.'
              : 'View your course subjects and teacher details.'}
          </p>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Class
          </button>
        )}
      </div>

      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search classes by name, subject, or code..."
          className="w-full text-sm text-gray-800 focus:outline-none"
        />
      </div>

      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {cls.code}
                  </span>
                  {isTeacher && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(cls, e)}
                        title="Edit Class"
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClass(cls._id, cls.name, e)}
                        title="Delete Class"
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-800">{cls.name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Subject: {cls.subject}</p>
                {cls.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{cls.description}</p>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {cls.enrolledStudents?.length || cls.studentCount || 0} Students
                </span>

                <Link
                  to={`/classes/${cls._id}`}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  {isTeacher ? 'Manage Roster' : 'View Class'} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-700">No classes found</h3>
          <p className="text-xs text-gray-500 mt-1">
            {searchTerm ? 'Try adjusting your search query.' : 'Click "Create Class" above to set up your first class.'}
          </p>
        </div>
      )}

      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Class Details' : 'Create New Class'}
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Class Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Class Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS201"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter brief description of this course..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {saving ? 'Saving...' : editingClass ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
