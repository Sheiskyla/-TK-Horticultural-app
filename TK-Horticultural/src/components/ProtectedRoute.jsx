import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContextCore';
import { auth } from '../firebase';
import { hasAdminRole } from '../lib/adminAccess';

export default function ProtectedRoute({ children }) {
  const { currentUser: ctxUser, loading } = useAuth();
  const currentUser = ctxUser || auth.currentUser;
  const location = useLocation();
  const [roleState, setRoleState] = useState({ uid: null, status: 'checking', isAdmin: false, error: '' });

  useEffect(() => {
    let active = true;
    if (!currentUser) return undefined;

    hasAdminRole(currentUser)
      .then((allowed) => {
        if (!active) return;
        setRoleState({ uid: currentUser.uid, status: 'ready', isAdmin: allowed, error: '' });
      })
      .catch((error) => {
        console.error('Unable to verify account role:', error);
        if (!active) return;
        setRoleState({
          uid: currentUser.uid,
          status: 'error',
          isAdmin: false,
          error: 'Unable to verify your account role. Please refresh and try again.',
        });
      });
    return () => { active = false; };
  }, [currentUser]);

  const checkingRole = Boolean(currentUser) && (
    roleState.uid !== currentUser.uid || roleState.status === 'checking'
  );
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-400">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleState.status === 'error') return <div role="alert" className="min-h-screen grid place-items-center bg-slate-950 p-6 text-center text-rose-300">{roleState.error}</div>;
  if (roleState.isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
