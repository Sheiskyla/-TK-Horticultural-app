import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContextCore';
import { hasAdminRole } from '../lib/adminAccess';

export default function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
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
        console.error('Unable to verify administrator role:', error);
        if (!active) return;
        setRoleState({
          uid: currentUser.uid,
          status: 'error',
          isAdmin: false,
          error: 'Unable to verify admin access. Please try again.',
        });
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  const checkingRole = Boolean(currentUser) && (
    roleState.uid !== currentUser.uid || roleState.status === 'checking'
  );
  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <p className="text-sm">Verifying administrator access…</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/admin/login" replace />;
  if (roleState.status === 'error') {
    return <div role="alert" className="min-h-screen grid place-items-center bg-slate-950 p-6 text-center text-rose-300">{roleState.error}</div>;
  }
  if (!roleState.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
