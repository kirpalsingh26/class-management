import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck,
  FileText,
  Bell,
  LogOut,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isTeacher, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/teachers', label: 'Manage Faculty', icon: Users },
    { to: '/classes', label: 'All Classes', icon: BookOpen },
    { to: '/students', label: 'All Students', icon: GraduationCap },
    { to: '/announcements', label: 'Announcements', icon: Bell },
  ];

  const teacherLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/classes', label: 'My Classes', icon: BookOpen },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/work', label: 'Assignments & Work', icon: FileText },
    { to: '/announcements', label: 'Announcements', icon: Bell },
  ];

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/classes', label: 'My Classes', icon: BookOpen },
    { to: '/my-attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/work', label: 'Assignments & Work', icon: FileText },
    { to: '/announcements', label: 'Announcements', icon: Bell },
  ];

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center gap-3 px-6 h-16 bg-slate-950 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Class Management</h1>
              <p className="text-[11px] text-blue-400 font-medium">System Portal</p>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <p className="text-xs text-slate-400">Signed in as:</p>
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                  : isTeacher
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                  : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
              }`}
            >
              {isAdmin
                ? 'Administrator'
                : isTeacher
                ? `Teacher • ${user?.department || 'Faculty'}`
                : `Student • ${user?.rollNumber || 'Enrolled'}${user?.course ? ` (${user.course})` : ''}`}
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
