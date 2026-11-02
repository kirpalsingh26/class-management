import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  Trash2,
  Edit,
  ArrowRight,
  Upload,
} from 'lucide-react';

export default function Work() {
  const { isTeacher } = useAuth();

  const [works, setWorks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeType, setActiveType] = useState('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('assignment');
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [requiresSubmission, setRequiresSubmission] = useState(true);
  const [maxMarks, setMaxMarks] = useState(100);
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeType !== 'ALL') params.type = activeType;
      if (selectedClassFilter !== 'ALL') params.classId = selectedClassFilter;

      const [workRes, classRes] = await Promise.all([
        api.get('/work', { params }),
        api.get('/classes'),
      ]);

      setWorks(workRes.data.data.works || []);
      setClasses(classRes.data.data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeType, selectedClassFilter]);

  const handleOpenCreate = () => {
    setEditingWork(null);
    setTitle('');
    setDescription('');
    setType('assignment');
    setSelectedClassIds(classes.length > 0 ? [classes[0]._id] : []);
    setDueDate('');
    setRequiresSubmission(true);
    setMaxMarks(100);
    setFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingWork(w);
    setTitle(w.title);
    setDescription(w.description || '');
    setType(w.type);
    setSelectedClassIds(w.classIds?.map((c) => c._id || c) || []);
    setDueDate(w.dueDate ? new Date(w.dueDate).toISOString().split('T')[0] : '');
    setRequiresSubmission(Boolean(w.requiresSubmission));
    setMaxMarks(w.maxMarks || 100);
    setFile(null);
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

  const handleSaveWork = async (e) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Please enter a coursework title.');
      return;
    }

    if (selectedClassIds.length === 0) {
      setFormError('Please select at least one target class.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const cleanDesc = (description || cleanTitle).trim();
      const formData = new FormData();
      formData.append('title', cleanTitle);
      formData.append('description', cleanDesc);
      formData.append('type', type);
      formData.append('classIds', JSON.stringify(selectedClassIds));
      if (dueDate) formData.append('dueDate', dueDate);
      formData.append('requiresSubmission', requiresSubmission);
      formData.append('maxMarks', maxMarks);
      if (file) formData.append('file', file);

      if (editingWork) {
        await api.put(`/work/${editingWork._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/work', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save coursework.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWork = async (id, title, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"? All student submissions will also be deleted.`)) {
      return;
    }

    try {
      await api.delete(`/work/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete work item');
    }
  };

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

  const typeOptions = [
    { id: 'ALL', label: 'All Items' },
    { id: 'assignment', label: 'Assignments' },
    { id: 'classwork', label: 'Classwork' },
    { id: 'project', label: 'Projects' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments & Coursework</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isTeacher
              ? 'Publish homework, classwork, notes, and study material across classes.'
              : 'Access study materials, lecture notes, and view assigned coursework.'}
          </p>
        </div>

        {isTeacher && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Upload New Work
          </button>
        )}
      </div>

      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap gap-1.5">
          {typeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActiveType(opt.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeType === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Filter Class:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : works.length > 0 ? (
        <div className="space-y-4">
          {works.map((item) => (
            <div
              key={item._id}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                    {item.type}
                  </span>
                  {isTeacher ? (
                    item.requiresSubmission && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Submission Required • Max Marks: {item.maxMarks || 100}
                      </span>
                    )
                  ) : (
                    item.maxMarks > 0 && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Max Marks: {item.maxMarks}
                      </span>
                    )
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                  <span>
                    Assigned to:{' '}
                    <strong className="text-gray-700">
                      {item.classIds?.map((c) => c.name || c).join(', ') || 'Classes'}
                    </strong>
                  </span>
                  {item.dueDate && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> Due: {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {item.attachment && (
                    <button
                      type="button"
                      onClick={() => handleDownload(item._id, item.attachment.originalName)}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {item.attachment.originalName}
                    </button>
                  )}
                </div>
              </div>

              
              <div className="flex items-center gap-2 shrink-0">
                {isTeacher ? (
                  <>
                    <Link
                      to={`/work/${item._id}`}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-md text-xs font-semibold transition"
                    >
                      Submissions ({item.submissionCount || 0})
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(item, e)}
                      title="Edit Work"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteWork(item._id, item.title, e)}
                      title="Delete Work"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link
                    to={`/work/${item._id}`}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-700">No coursework items found</h3>
          <p className="text-xs text-gray-500 mt-1">
            {activeType !== 'ALL' || selectedClassFilter !== 'ALL'
              ? 'Try clearing the selected filters.'
              : 'No assignments or study materials posted yet.'}
          </p>
        </div>
      )}

      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWork ? 'Edit Coursework' : 'Upload New Work / Assignment'}
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveWork} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lab 4: Binary Search Trees"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="assignment">Assignment</option>
                <option value="classwork">Classwork</option>
                <option value="project">Project</option>
                <option value="notes">Notes / Material</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Max Marks (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Target Classes <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide assignment guidelines or reference details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Attach File (PDF, DOCX, PPTX, Images - Max 10MB)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
              {saving ? 'Saving...' : editingWork ? 'Update Work' : 'Publish Work'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
