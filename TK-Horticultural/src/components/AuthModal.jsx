import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/authContextCore';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2,
  Leaf, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal({ 
  isOpen = true, 
  onClose, 
  initialMode = 'login',
  isDarkMode = true,
  onSuccess 
}) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const getAuthErrorMessage = (err) => {
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 8 characters.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled before completing.';
      case 'auth/popup-blocked':
        return 'Sign-In popup was blocked by browser. Please allow popups for this site.';
      case 'auth/operation-not-allowed':
        return 'Email sign-in is currently unavailable.';
      case 'auth/unauthorized-domain':
        return 'This website is not authorized for Google OAuth.';
      default:
        return err.message || 'An error occurred during authentication.';
    }
  };

  const validateForm = () => {
    setErrorMsg('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
      if (!phoneNumber.trim()) {
        setErrorMsg('Please enter your phone number.');
        return false;
      }
      if (!password) {
        setErrorMsg('Please enter a password.');
        return false;
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password.');
        return false;
      }
    } else {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return false;
      }
      if (!password) {
        setErrorMsg('Please enter your password.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        await signup(email, password, fullName);
        setSuccessMsg('Account created successfully! Redirecting...');
      } else {
        await login(email, password);
        setSuccessMsg('Logged in successfully! Redirecting...');
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (response) => {
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await loginWithGoogle(response.credential);
      setSuccessMsg('Google Authentication successful! Redirecting...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {onClose && (
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Close auth modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-1">
            <Leaf className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            TK Horticultural
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Cleaning, Landscaping & Waste Services
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-start gap-3 text-xs font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        <div className={`p-1 rounded-xl flex gap-1 mb-5 ${isDarkMode ? 'bg-slate-950/80 border border-slate-800' : 'bg-slate-100 border border-slate-200'}`}>
          <button
            type="button"
            onClick={() => handleModeToggle('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? isDarkMode ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? isDarkMode ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {mode === 'signup' && (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border font-semibold outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border font-semibold outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-white' 
                    : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="07423 018166"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border font-semibold outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border font-semibold outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-white' 
                    : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border font-semibold outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-wider">
            <span className={`px-3 ${isDarkMode ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>
              or sign in with Google
            </span>
          </div>
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSignIn}
          onError={() => setErrorMsg('Google sign-in failed. Please try again.')}
          useOneTap={false}
          prompt="select_account"
          auto_select={false}
        />

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure SSL Encrypted OAuth</span>
        </div>
      </div>
    </div>
  );
}
