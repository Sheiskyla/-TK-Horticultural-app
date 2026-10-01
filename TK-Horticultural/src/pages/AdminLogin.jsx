import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, signOut } from '../firebase';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  Sparkles,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminLogin({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const bgImage = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=80";

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminEmail || !adminPassword) {
      setErrorMsg('Please enter both your Admin Email and Security Password.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;

      const tokenResult = await user.getIdTokenResult();
      const isAdminClaim = !!tokenResult.claims.admin;
      const isAdminEmail = adminEmail.toLowerCase().includes('admin') || 
                           adminEmail.toLowerCase().endsWith('@tkhorticultural.co.uk') || 
                           adminEmail.toLowerCase() === 'admin@tkservices.com';

      if (!isAdminClaim && !isAdminEmail) {
        await signOut(auth);
        setErrorMsg('Access Denied: This user account lacks verified TK Services Administrator privileges.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Admin Credentials Verified. Accessing Administrative Portal...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1200);

    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid Administrator credentials or security password.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Access blocked due to multiple failed attempts. Please wait a few moments.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify your Administrator account details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-md transition-all ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4 text-emerald-500" />
          <span>Back to Website</span>
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
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-4">
        
        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-lg ${
          isDarkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            TK Admin Portal
          </span>
        </div>

        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-2xl border-2 border-emerald-500/50 flex items-center justify-center shadow-xl ${
            isDarkMode ? 'bg-slate-900 text-emerald-400' : 'bg-white text-emerald-600'
          }`}>
            <ShieldCheck className="w-9 h-9" />
          </div>
        </div>

        <div>
          <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Administrator Authentication
          </h2>
          <p className={`text-xs mt-1.5 font-medium max-w-xs mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Restricted access for authorized TK Services management & operations staff.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className={`py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border backdrop-blur-xl space-y-6 ${
          isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3 shadow-md animate-shake">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-left space-y-0.5">
                <p className="font-extrabold">Unauthorized Access Attempt</p>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3 shadow-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="font-bold text-left">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5 text-left">
            <div>
              <label className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Admin PIN Code <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                  2FA Active
                </span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={6}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors font-mono tracking-widest ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 transition-all text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Administrator Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Authenticate & Enter Admin Portal</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Standard user account?{' '}
              <Link to="/login" className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline">
                Client Login Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
