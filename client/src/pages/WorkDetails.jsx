import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Download,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function WorkDetails() {
  const { id } = useParams();
  const { isTeacher } = useAuth();

  const [work, setWork] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [gradingState, setGradingState] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);

  const fetchWorkDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/work/${id}`);
      const data = res.data.data;
      setWork(data.work);

      if (isTeacher) {
        const subRes = await api.get(`/work/${id}/submissions`);
        const subList = subRes.data.data.submissions || [];
        setSubmissions(subList);

        const initialGrading = {};
        subList.forEach((s) => {
          initialGrading[s._id] = {
            marks: s.marks ?? '',
            feedback: s.feedback || '',
          };
        });
        setGradingState(initialGrading);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkDetails();
  }, [id, isTeacher]);

  const handleDownload = async (url, filename) => {
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename || 'attachment');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download file attachment.');
    }
  };

  const handleSaveGrade = async (submissionId) => {
    setSavingGradeId(submissionId);
    try {
      const current = gradingState[submissionId] || {};
      await api.put(`/work/submissions/${submissionId}/grade`, {
        marks: Number(current.marks),
        feedback: current.feedback,
      });
      alert('Grade and feedback saved successfully!');
      fetchWorkDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grade.');
    } finally {
      setSavingGradeId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-red-800">Error</h3>
        <p className="text-sm text-red-600 mt-1">{error || 'Work item not found.'}</p>
        <Link to="/work" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:underline">
          ← Back to all work
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <Link to="/work" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to coursework list
        </Link>
      </div>

      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
              {work.type}
            </span>
            {work.requiresSubmission && (
              <span className="text-xs text-gray-500 font-medium">
                Max Marks: <strong>{work.maxMarks || 100}</strong>
              </span>
            )}
          </div>

          {work.dueDate && (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
              <Calendar className="w-3.5 h-3.5" /> Due: {new Date(work.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{work.title}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Assigned by: <strong className="text-gray-700">{work.teacherId?.name || 'Instructor'}</strong> • Target Classes:{' '}
            <strong className="text-gray-700">{work.classIds?.map((c) => c.name || c).join(', ')}</strong>
          </p>
        </div>

        {work.description && (
          <div className="p-4 bg-gray-50 rounded-md border border-gray-100 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {work.description}
          </div>
        )}

        
        {work.attachment && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Attached Study Material / File:</p>
            <button
              type="button"
              onClick={() => handleDownload(`/work/${work._id}/download`, work.attachment.originalName)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-semibold transition border border-blue-200"
            >
              <Download className="w-4 h-4" />
              Download {work.attachment.originalName} ({Math.round((work.attachment.size || 0) / 1024)} KB)
            </button>
          </div>
        )}
      </div>

      
      
      
      {!isTeacher && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Student Coursework Notice</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Please review the assignment instructions and syllabus references above. If reference notes or worksheets are attached, click the download button above to save the materials to your device.
            </p>
            {work.dueDate && (
              <p className="text-xs text-red-600 font-medium mt-2">
                Submission Due Date: {new Date(work.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      
      
      
      {isTeacher && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">
                Student Submissions ({submissions.length})
              </h2>
              <p className="text-xs text-gray-500">
                Review turned-in work, download files, and assign grades & feedback.
              </p>
            </div>
          </div>

          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100 text-gray-700 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Response / Attachment</th>
                    <th className="py-3 px-4 w-32">Marks (Max: {work.maxMarks || 100})</th>
                    <th className="py-3 px-4">Feedback</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub) => {
                    const gradeData = gradingState[sub._id] || { marks: '', feedback: '' };
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">{sub.studentId?.name || 'Student'}</p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {sub.studentId?.rollNumber ? `Roll: ${sub.studentId.rollNumber}` : sub.studentId?.email}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-gray-500">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 space-y-1">
                          {sub.responseText && (
                            <p className="text-gray-700 line-clamp-2 italic">"{sub.responseText}"</p>
                          )}
                          {sub.attachment && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  `/work/submissions/${sub._id}/download`,
                                  sub.attachment.originalName
                                )
                              }
                              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                            >
                              <Download className="w-3 h-3" /> {sub.attachment.originalName}
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max={work.maxMarks || 100}
                            value={gradeData.marks}
                            onChange={(e) =>
                              setGradingState((prev) => ({
                                ...prev,
                                [sub._id]: { ...prev[sub._id], marks: e.target.value },
                              }))
                            }
                            placeholder="Marks"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={gradeData.feedback}
                            onChange={(e) =>
                              setGradingState((prev) => ({
                                ...prev,
                                [sub._id]: { ...prev[sub._id], feedback: e.target.value },
                              }))
                            }
                            placeholder="Optional feedback..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={savingGradeId === sub._id}
                            onClick={() => handleSaveGrade(sub._id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition disabled:opacity-50"
                          >
                            {savingGradeId === sub._id ? 'Saving...' : 'Save Grade'}
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
              No students have turned in this assignment yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
