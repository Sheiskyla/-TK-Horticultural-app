import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContextCore';
import { Loader2 } from 'lucide-react';

export default function ProtectedAdminRoute({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [checkState, setCheckState] = useState({
    checking: true,
    isAllowed: false,
    errorMessage: ''
  });

  useEffect(() => {
    let active = true;

    if (authLoading) return;

    if (!currentUser) {
      const timer = window.setTimeout(() => {
        if (active) {
          setCheckState({ checking: false, isAllowed: false, errorMessage: '' });
        }
      }, 0);
      return () => {
        active = false;
        window.clearTimeout(timer);
      };
    }

    const checkingTimer = window.setTimeout(() => {
      if (active) {
        setCheckState({ checking: true, isAllowed: false, errorMessage: '' });
      }
    }, 0);

    Promise.resolve(Boolean(currentUser.is_admin))
      .then((allowed) => {
        clearTimeout(checkingTimer);
        if (!active) return;
        if (!allowed) {
          console.warn(`User ${currentUser.email} attempted to access protected admin area without admin role.`);
          if (active) {
            setCheckState({
              checking: false,
              isAllowed: false,
              errorMessage: 'This account does not have administrator privileges.'
            });
          }
          return;
        }
        if (active) {
          setCheckState({ checking: false, isAllowed: true, errorMessage: '' });
        }
      })
      .catch((error) => {
        clearTimeout(checkingTimer);
        console.error('Failed to verify administrator role:', error);
        if (active) {
          setCheckState({
            checking: false,
            isAllowed: false,
            errorMessage: 'Unable to verify administrator role. Please refresh and try again.'
          });
        }
      });

    return () => {
      active = false;
      clearTimeout(checkingTimer);
    };
  }, [currentUser, authLoading]);

  if (authLoading || checkState.checking) {
    return (
      <div
        className="min-h-screen grid place-items-center bg-slate-950 text-slate-300 font-sans"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm font-semibold tracking-wide">Verifying administrator security clearance…</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !checkState.isAllowed) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ message: checkState.errorMessage || 'Please sign in with an administrator account.' }}
      />
    );
  }

  return <>{children}</>;
}
