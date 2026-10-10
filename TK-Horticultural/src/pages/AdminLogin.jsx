import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from '../firebase';
import { hasAdminRole } from '../lib/adminAccess';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Home,
  ShieldAlert,
  Sun,
  Moon,
  Loader2,
  KeyRound,
  X
} from 'lucide-react';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=80';

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'Incorrect email or password. Please verify your admin account exists in Firebase.',
  'auth/wrong-password': 'Incorrect password. Click "Forgot password?" to reset it.',
  'auth/invalid-credential': 'Incorrect email or password. Please check your credentials.',
  'auth/user-disabled': 'This account has been disabled. Contact system support.',
  'auth/too-many-requests': 'Too many failed login attempts. Please wait a few minutes.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.'
};

export default function AdminLogin({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('tkhorticulture@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('tkhorticulture@gmail.com');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    let active = true;
    let initialCheckDone = false;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!active || initialCheckDone) return;
      initialCheckDone = true;

      if (user) {
        try {
          const isAdmin = await hasAdminRole(user);
          if (active && isAdmin) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
          await signOut(auth);
        } catch (err) {
          console.error('Session check verification error:', err);
          try {
            await signOut(auth);
          } catch (soErr) {
            console.error('Sign out error:', soErr);
          }
          if (active) setErrorMsg('Session verification failed. Please log in.');
        }
      }

      if (active) setCheckingSession(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting admin sign-in for: ${cleanEmail}`);
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      console.log('Firebase Auth sign-in successful. Verifying role...');
      let isAdmin = false;
      try {
        isAdmin = await hasAdminRole(user);
      } catch (roleErr) {
        console.error('Role verification error:', roleErr);
        await signOut(auth);
        setPassword('');
        setErrorMsg('Admin privilege verification failed. Please try again.');
        return;
      }

      if (!isAdmin) {
        console.warn(`User ${user.email} signed in but does not have admin role.`);
        await signOut(auth);
        setPassword('');
        setErrorMsg('Access denied. Account does not have administrator privileges.');
        return;
      }

      setPassword('');
      setSuccessMsg('Authentication successful. Redirecting to console…');
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('Admin login failed:', error.code, error.message);
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (soErr) {
          console.error('Post-error signout failed:', soErr);
        }
      }
      setPassword('');
      setErrorMsg(ERROR_MESSAGES[error.code] || error.message || 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setResetError('Please enter your administrator email.');
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSuccess(`Password reset link sent to ${cleanEmail}. Check your inbox.`);
    } catch (err) {
      console.error('Password reset error:', err);
      setResetError(ERROR_MESSAGES[err.code] || err.message || 'Failed to send reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  const inputClass = `w-full pl-10 py-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors ${
    isDarkMode
      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
  }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wider mb-2 ${
    isDarkMode ? 'text-slate-300' : 'text-slate-700'
  }`;

  if (checkingSession) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center font-sans ${
          isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'
        }`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-semibold">Checking administrator authentication…</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        aria-hidden="true"
      />

      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-md transition-all ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-white hover:bg-slate-800'
              : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4 text-emerald-500" />
          <span>Back to website</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
          className={`p-2.5 rounded-xl border transition-all shadow-md ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-4 px-4">
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-2xl border-2 border-emerald-500/50 flex items-center justify-center shadow-xl ${
              isDarkMode ? 'bg-slate-900 text-emerald-400' : 'bg-white text-emerald-600'
            }`}
          >
            <ShieldCheck className="w-9 h-9" />
          </div>
        </div>

        <div>
          <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Admin Sign In
          </h1>
          <p className={`text-sm mt-1.5 max-w-xs mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            TK Horticultural & Services Operations Console
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div
          className={`py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border backdrop-blur-xl space-y-6 ${
            isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          {location.state?.message && (
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{location.state.message}</span>
            </div>
          )}

          <div aria-live="polite">
            {errorMsg && (
              <div
                role="alert"
                className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
                  isDarkMode
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <ShieldAlert
                  className={`w-5 h-5 shrink-0 mt-0.5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}
                />
                <p className="text-left leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div
                className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
                  isDarkMode
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                />
                <p className="font-semibold text-left">{successMsg}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
            <div>
              <label htmlFor="admin-email" className={labelClass}>
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  className={`${inputClass} pr-4`}
                  placeholder="tkhorticulture@gmail.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="admin-password" className={labelClass}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || 'tkhorticulture@gmail.com');
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 hover:underline dark:text-emerald-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  className={`${inputClass} pr-11`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 transition-all text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div
            className={`pt-4 border-t text-center text-xs ${
              isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}
          >
            Not an administrator?{' '}
            <Link
              to="/login"
              className={`font-bold hover:underline ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
            >
              Go to Client Portal Login
            </Link>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Reset Admin Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetError('');
                  setResetSuccess('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your admin email address below. We will send a secure password reset link directly from Firebase Auth.
            </p>

            {resetError && (
              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs font-bold text-rose-500">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs font-bold text-emerald-400">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <label className={labelClass}>Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={`${inputClass} pr-4`}
                    placeholder="tkhorticulture@gmail.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${
                    isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50"
                >
                  {resetLoading ? 'Sending link…' : 'Send Reset Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
