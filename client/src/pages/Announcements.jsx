import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import { Bell, Plus, Trash2, Calendar, BookOpen } from 'lucide-react';

export default function Announcements() {
  const { isTeacher } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, classRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/classes'),
      ]);
      setAnnouncements(annRes.data.data.announcements || []);
      setClasses(classRes.data.data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setTitle('');
    setMessage('');
    setSelectedClassIds(classes.length > 0 ? [classes[0]._id] : []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleClass = (classId) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter((id) => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (selectedClassIds.length === 0) {
      setFormError('Please select at least one class for this notice.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await api.post('/announcements', {
        title,
        message,
        classIds: selectedClassIds,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notice Board & Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isTeacher
              ? 'Post important notifications and updates to specific classroom sections.'
              : 'Stay updated with official class announcements from your teachers.'}
          </p>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </button>
        )}
      </div>

      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{ann.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>By: <strong className="text-gray-700">{ann.teacherId?.name || 'Instructor'}</strong></span>
                  </div>
                </div>

                {isTeacher && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(ann._id)}
                    title="Delete Notice"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3.5 rounded-md border border-gray-100">
                {ann.message}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-gray-500 font-semibold">Target Classes:</span>
                <div className="flex flex-wrap gap-1">
                  {ann.classIds?.map((c) => (
                    <span
                      key={c._id || c}
                      className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                    >
                      {c.name || c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-700">No announcements posted</h3>
          <p className="text-xs text-gray-500 mt-1">
            {isTeacher
              ? 'Click "Post Notice" above to publish your first announcement.'
              : 'You have no new announcements from your teachers.'}
          </p>
        </div>
      )}

      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post New Announcement"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-term Exam Schedule & Syllabus"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Announcement Message
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full announcement text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Select Target Classes <span className="text-red-500">*</span>
              </label>
              {classes.length > 1 && (
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedClassIds(classes.map((c) => c._id))}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClassIds([])}
                    className="text-gray-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            {classes.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                No classes found. Please create a class first from the &quot;My Classes&quot; tab.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-md p-3 max-h-36 overflow-y-auto space-y-2">
                {classes.map((cls) => (
                  <label key={cls._id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(cls._id)}
                      onChange={() => handleToggleClass(cls._id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <strong>{cls.name}</strong> ({cls.code})
                    </span>
                  </label>
                ))}
              </div>
            )}
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
              {saving ? 'Posting...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
