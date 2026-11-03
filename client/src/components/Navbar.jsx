import { Menu, GraduationCap, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick, title = 'Dashboard' }) {
  const { user, isAdmin, isTeacher, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-block text-xs font-medium text-gray-500">
          {currentDate}
        </span>

        {isAdmin ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator
          </span>
        ) : isTeacher ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Teacher {user?.department ? `• ${user.department}` : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Student {user?.rollNumber ? `• ${user.rollNumber}` : ''}{user?.course ? ` (${user.course})` : ''}
          </span>
        )}

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
            <p className="text-[11px] text-gray-500 truncate max-w-36">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
