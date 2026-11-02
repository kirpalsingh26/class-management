import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md text-center max-w-md w-full">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mx-auto mb-3">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-4xl font-black text-gray-800">404</h1>
        <h2 className="text-base font-bold text-gray-700 mt-2">Page Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          The requested page does not exist or you don't have permission to access it.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
