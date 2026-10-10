import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContextCore';
import { sendPasswordResetEmail, auth } from '../firebase';
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Phone,
  X,
  ShieldCheck,
  Send,
  Home,
  Loader2
} from 'lucide-react';

export default function Login({ isDarkMode }) {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const bgImage = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=80";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailOrPhone || !password) {
      setErrorMsg('Please enter both your email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      await login(emailOrPhone, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email sign-in is disabled in Firebase. Enable Email/Password under Firebase Authentication > Sign-in method.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('This website is not authorized in Firebase. Add tk-horticultural.vercel.app under Authentication > Settings > Authorized domains.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail) {
      setResetError('Please enter your account email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setIsForgotModalOpen(false);
        setResetEmail('');
      }, 2500);
    } catch (err) {
      setResetError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'hero-bg-overlay-dark' : 'hero-bg-overlay-light'
        }`}></div>

      <div className="relative z-10 w-full max-w-5xl my-8 grid grid-cols-1 lg:grid-cols-12 rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-md">

        <div className={`lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between text-left ${isDarkMode ? 'bg-slate-900/95 border-r border-slate-800 text-white' : 'bg-gradient-to-br from-emerald-800 to-teal-900 text-white'
          }`}>
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
              <span>Back to Main Page</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Leaf className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">TK Horticultural</h2>
                <p className="text-xs text-emerald-200">Cleaning & Waste Services</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Welcome Back to Your Account
              </h1>
              <p className="text-xs text-slate-200 leading-relaxed">
                Sign in to manage your garden care bookings, service invoices, and waste clearance requests across Gravesend & Kent.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-8 border-t border-white/10 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Environment Agency Licensed Carrier</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct Support: 07423 018166</span>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-7 p-8 sm:p-10 text-left flex flex-col justify-between ${isDarkMode ? 'bg-slate-950/95 text-white' : 'bg-white text-slate-900'
          }`}>
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Account Access</span>
              <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sign In</h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Enter your registered email address.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="you@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 rounded-xl border focus:outline-none focus:border-emerald-500 font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3.5 rounded-xl border focus:outline-none focus:border-emerald-500 font-medium ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg text-sm flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-wider">
                <span className={`px-3 ${isDarkMode ? 'bg-slate-950 text-slate-500' : 'bg-white text-slate-400'}`}>
                  or sign in with Google
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className={`w-full py-3.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-3 transition-all duration-200 shadow-sm ${isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                }`}
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 mt-6">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Don't have an account yet?
            </span>
            <Link
              to="/signup"
              className="font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Create New Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`relative w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-2xl text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black mb-2 text-white">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your email address and we will send you instructions to reset your password.
            </p>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Password reset link sent! Check your email inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reset Email</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
