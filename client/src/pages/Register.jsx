import { Link } from 'react-router-dom';
import { GraduationCap, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-md p-6 sm:p-8 text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Registration Restricted</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Public self-registration is disabled. Institutional accounts are provisioned exclusively by authorized personnel:
        </p>

        <div className="mt-4 p-4 bg-slate-50 border border-gray-200 rounded-md text-left text-xs space-y-2 text-gray-700">
          <p>
            <strong className="text-gray-900 font-semibold">• Faculty Accounts:</strong> Created and provisioned directly by the <strong>System Administrator</strong>.
          </p>
          <p>
            <strong className="text-gray-900 font-semibold">• Student Accounts:</strong> Enrolled and credentialed by the <strong>Course Teacher</strong> when added to class rosters.
          </p>
        </div>

        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
