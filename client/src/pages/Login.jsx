import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, User, KeyRound } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management System</h1>
          <p className="text-sm text-gray-500 mt-1">Academic & Institutional Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@cms.dev, teacher@cms.dev, kirpal@cms.dev"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
            Quick Demo Accounts (For Viva / Evaluation)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@cms.dev', 'password123')}
              className="flex flex-col items-center justify-center p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-xs font-medium transition"
            >
              <KeyRound className="w-3.5 h-3.5 mb-1" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('teacher@cms.dev', 'password123')}
              className="flex flex-col items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-medium transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 mb-1" />
              Teacher
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('kirpal@cms.dev', 'password123')}
              className="flex flex-col items-center justify-center p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md text-xs font-medium transition"
            >
              <User className="w-3.5 h-3.5 mb-1" />
              Student
            </button>
          </div>
        </div>

        <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-md text-center">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <strong className="text-gray-700 font-semibold block mb-0.5">Closed Institution Hierarchy</strong>
            Self-registration is disabled. Admin provisions teacher accounts, and teachers provision student credentials when adding students to classes.
          </p>
        </div>
      </div>
    </div>
  );
}
