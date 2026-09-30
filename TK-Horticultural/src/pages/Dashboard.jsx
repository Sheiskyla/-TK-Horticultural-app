import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { 
  Leaf, 
  Sparkles, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  ChevronRight, 
  LogOut,
  RefreshCw,
  Zap,
  TrendingUp,
  Sun,
  Moon,
  LayoutDashboard,
  Home
} from 'lucide-react';
import { auth, signOut } from '../firebase';

export default function Dashboard({ isDarkMode, setIsDarkMode, currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');

  const demoBookings = [
    {
      id: 'TK-849201',
      service: 'Horticultural & Lawn Maintenance',
      date: '2026-09-28',
      slot: '9am–12pm',
      status: 'Confirmed',
      address: '14 High Street, Gravesend, Kent',
      price: '£85.00',
      type: 'Horticulture'
    },
    {
      id: 'TK-731920',
      service: 'Driveway Jet Washing & Patio Clean',
      date: '2026-10-02',
      slot: '12pm–3pm',
      status: 'Pending Quote',
      address: '14 High Street, Gravesend, Kent',
      price: '£120.00',
      type: 'Cleaning'
    },
    {
      id: 'TK-610482',
      service: 'Garden Waste Clearance & Disposal',
      date: '2026-09-15',
      slot: '3pm–6pm',
      status: 'Completed',
      address: '14 High Street, Gravesend, Kent',
      price: '£65.00',
      type: 'Waste'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-emerald-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <header className={`sticky top-0 z-40 border-b shadow-md transition-colors ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div 
            onClick={() => { setActiveTab('bookings'); navigate('/dashboard'); }} 
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
              TK
            </div>
            <div>
              <span className={`font-black text-lg sm:text-xl tracking-tight block leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                TK Services
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-widest uppercase block mt-0.5">
                Client Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-2 shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-750' 
                  : 'bg-slate-100 border-slate-300 text-emerald-800 hover:bg-slate-200'
              }`}
              title="Go to Main Landing Page"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-black leading-tight text-slate-900 dark:text-white">
                  {currentUser?.displayName || 'Client'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {currentUser?.email || 'Logged In'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
            isDarkMode ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
                {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Client Portal</span>
                <h1 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Welcome, {currentUser?.displayName || 'Valued Client'}
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {currentUser?.email || 'client@example.com'} • Account Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/booking')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Request New Booking</span>
              </button>

              <button
                onClick={handleSignOut}
                className={`p-3 rounded-xl border transition-colors ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-rose-400 hover:bg-rose-950/40' : 'bg-slate-100 border-slate-300 text-rose-600 hover:bg-rose-50'
                }`}
                title="Log Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Bookings</span>
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>3</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">1 Confirmed upcoming</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Service Division</span>
                <Leaf className="w-5 h-5 text-emerald-500" />
              </div>
              <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Horticulture</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Primary Service Type</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Waste Carrier</span>
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-2xl font-black text-emerald-500 mt-2">Verified</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Environment Agency Licensed</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Direct Support</span>
                <Phone className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">07423 018166</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mon - Sat: 07:30 - 18:00</p>
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl text-left space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                My Bookings & Quotes
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Account Profile
              </button>
            </div>

            {activeTab === 'bookings' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Active & Past Service Requests
                  </h3>
                  <button
                    onClick={() => navigate('/booking')}
                    className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>+ Book New Service</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {demoBookings.map((b) => (
                    <div key={b.id} className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{b.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                              : b.status === 'Pending Quote'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.service}</h4>
                        <div className={`flex flex-wrap items-center gap-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                            {b.date} ({b.slot})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            {b.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
                        <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.price}</span>
                        <a
                          href={`https://wa.me/447423018166?text=Query regarding Booking Ref: ${b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-xl">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Account Details & Service Address
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className={`block font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        readOnly
                        value={currentUser?.displayName || 'Sarah Jenkins'}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border font-bold ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        readOnly
                        value={currentUser?.email || 'sarah@example.com'}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border font-bold ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Primary Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        defaultValue="07423 018166"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border font-bold ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Default Property Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        defaultValue="14 High Street, Gravesend, Kent, DA11 0AA"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border font-bold ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer 
        onRequestQuote={() => navigate('/booking')}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

