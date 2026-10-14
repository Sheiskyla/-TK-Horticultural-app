import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContextCore';

export default function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <p className="text-sm">Verifying administrator access…</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/admin/login" replace />;
  if (!currentUser.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}
