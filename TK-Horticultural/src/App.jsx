import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import QuoteWizard from './pages/QuoteWizard';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { 
  Leaf, 
  Sparkles, 
  Trash2, 
  Sparkle, 
  CheckCircle, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Calendar, 
  ArrowRight, 
  X, 
  Send,
  Clock,
  CheckCircle2,
  Zap,
  Recycle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

function LandingPage({ isDarkMode, setIsDarkMode, currentUser }) {
  const navigate = useNavigate();
  const [bookingService, setBookingService] = useState('Horticultural & Landscaping');
  const [bookingDate, setBookingDate] = useState('2026-09-28');
  const [selectedSlot, setSelectedSlot] = useState('9am–12pm');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [expandedDivision, setExpandedDivision] = useState('all');

  const timeSlots = [
    { id: 'slot-1', time: '9am–12pm', status: 'Available' },
    { id: 'slot-2', time: '12pm–3pm', status: 'Booked' },
    { id: 'slot-3', time: '3pm–6pm', status: 'Available' },
  ];

  const handleSlotBooking = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
    }, 3500);
  };

  const heroBgImage = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=80";

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-emerald-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar 
        onRequestQuote={() => navigate('/booking')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
      />

      <main className="flex-grow">
        
        <section id="home" className="relative py-20 lg:py-28 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{ backgroundImage: `url(${heroBgImage})` }}
          ></div>

          <div className={`absolute inset-0 pointer-events-none ${
            isDarkMode ? 'hero-bg-overlay-dark' : 'hero-bg-overlay-light'
          }`}></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 text-left space-y-5 sm:space-y-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border shadow-sm max-w-full ${
                  isDarkMode 
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate">
                    Gravesend & Kent Premier Team
                  </span>
                </div>

                <h1 className={`text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-tight break-words ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Professional Gardening, Deep Cleaning & Waste Disposal in <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">Gravesend, Kent</span>
                </h1>

                <p className={`text-sm sm:text-lg max-w-2xl leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700 font-medium'
                }`}>
                  Local experts providing fast, reliable, and eco-friendly property maintenance. From precision landscaping to pressure washing and Environment Agency licensed waste removal.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={() => navigate('/booking')}
                    className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base group"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                    <span>Get a Free Quote</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <a
                    href="https://wa.me/447423018166"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-bold border shadow-md transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base ${
                      isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-300 dark:border-slate-800">
                  <div className="text-left">
                    <p className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400 truncate">07423 018166</p>
                    <p className={`text-[10px] sm:text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>Direct Phone 1</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-lg font-black text-teal-600 dark:text-teal-300 truncate">07405 681878</p>
                    <p className={`text-[10px] sm:text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>Direct Phone 2</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm sm:text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Gravesend</p>
                    <p className={`text-[10px] sm:text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>Kent Local Base</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400">Licensed</p>
                    <p className={`text-[10px] sm:text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>Waste Carrier</p>
                  </div>
                </div>

              </div>

              <div className="lg:col-span-5 relative">
                <div className={`relative rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-slate-900/90 border-slate-800' 
                    : 'bg-white/95 border-slate-200'
                }`}>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>TK Services Guarantee</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Fully Insured & Local Experts</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                      Kent
                    </span>
                  </div>

                  <div className="space-y-3.5 text-left">
                    <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Horticultural & Landscaping</h5>
                        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mowing, paving, fencing, hedges & levelling</p>
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Deep Cleaning & Jet Wash</h5>
                        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Driveway pressure cleaning, carpet & office care</p>
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Licensed Waste Disposal</h5>
                        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rubbish clearance, green waste & recycling</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <a
                      href="tel:07423018166"
                      className="flex-1 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors text-center shadow-md"
                    >
                      Call 07423 018166
                    </a>
                    <a
                      href="tel:07405681878"
                      className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-colors text-center ${
                        isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      Call 07405 681878
                    </a>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        <section id="services" className={`py-20 border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
              }`}>
                3 Main Service Divisions
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Our Core Services in Gravesend & Kent
              </h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Explore our main divisions and click to book your required service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div 
                onClick={() => setExpandedDivision(expandedDivision === 'horticulture' ? 'all' : 'horticulture')}
                className={`rounded-3xl p-7 border transition-all duration-300 text-left space-y-5 flex flex-col justify-between cursor-pointer group shadow-xl ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/50' 
                    : 'bg-slate-50/90 border-slate-200 hover:border-emerald-500/50 shadow-slate-200/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-500/20">
                    <Leaf className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Horticultural & Landscaping
                      </h3>
                      <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform ${expandedDivision === 'horticulture' ? 'rotate-180' : ''}`} />
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Complete garden transformations and outdoor care.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    {[
                      'Lawn mowing',
                      'Land levelling',
                      'Lawn establishment',
                      'Fencing',
                      'Paver laying',
                      'Hedge planting & pruning',
                      'General garden maintenance'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/booking'); }}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 mt-4 shadow-md"
                >
                  <span>Book Gardening Service</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div 
                onClick={() => setExpandedDivision(expandedDivision === 'cleaning' ? 'all' : 'cleaning')}
                className={`rounded-3xl p-7 border transition-all duration-300 text-left space-y-5 flex flex-col justify-between cursor-pointer group shadow-xl ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 hover:border-teal-500/50' 
                    : 'bg-slate-50/90 border-slate-200 hover:border-teal-500/50 shadow-slate-200/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-teal-500/20">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Cleaning Services
                      </h3>
                      <ChevronDown className={`w-5 h-5 text-teal-500 transition-transform ${expandedDivision === 'cleaning' ? 'rotate-180' : ''}`} />
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Deep cleaning, jet washing & commercial care.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    {[
                      'Carpet washing',
                      'Deep cleaning',
                      'Residential cleaning',
                      'Office cleaning',
                      'Jet / pressure washing'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/booking'); }}
                  className="w-full py-3 rounded-xl bg-teal-500 text-slate-950 font-black text-xs hover:bg-teal-400 transition-all flex items-center justify-center gap-2 mt-4 shadow-md"
                >
                  <span>Book Cleaning Service</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div 
                onClick={() => setExpandedDivision(expandedDivision === 'waste' ? 'all' : 'waste')}
                className={`rounded-3xl p-7 border transition-all duration-300 text-left space-y-5 flex flex-col justify-between cursor-pointer group shadow-xl ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/50' 
                    : 'bg-slate-50/90 border-slate-200 hover:border-emerald-500/50 shadow-slate-200/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-500/20">
                    <Trash2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Rubbish & Waste Disposal
                      </h3>
                      <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform ${expandedDivision === 'waste' ? 'rotate-180' : ''}`} />
                    </div>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Licensed waste carrier & eco-friendly recycling.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    {[
                      'Rubbish removal',
                      'Garden waste removal',
                      'General waste clearance',
                      'Waste disposal'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/booking'); }}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 mt-4 shadow-md"
                >
                  <span>Book Waste Clearance</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </section>

        <section id="booking" className={`py-20 border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
              }`}>
                Interactive Slot Booking
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Reserve Your Preferred Service Slot
              </h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Select your service, choose a date, and pick an available time slot.
              </p>
            </div>

            <div className={`max-w-4xl mx-auto border rounded-3xl p-6 sm:p-10 shadow-2xl text-left space-y-8 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    1. Select Service Division
                  </label>
                  <select
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border font-semibold text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option>Horticultural & Landscaping</option>
                    <option>Lawn Mowing & Maintenance</option>
                    <option>Hedge Planting & Pruning</option>
                    <option>Paver Laying & Fencing</option>
                    <option>Jet / Pressure Washing</option>
                    <option>Carpet & Deep Cleaning</option>
                    <option>Rubbish & Waste Disposal</option>
                    <option>Garden Waste Removal</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    2. Select Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border font-semibold text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  3. Select Visual Time Slot
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const isAvailable = slot.status === 'Available';

                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (isAvailable) setSelectedSlot(slot.time);
                        }}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                          isAvailable
                            ? isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                              : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                            : 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-black flex items-center gap-1.5 ${
                            isSelected ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            <Clock className="w-4 h-4 text-emerald-500" />
                            {slot.time}
                          </span>
                          
                          {isAvailable ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                              Available
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                              Booked
                            </span>
                          )}
                        </div>

                        <p className={`text-[11px] ${isSelected ? 'text-emerald-100' : isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {isAvailable ? 'Open slot for Gravesend / Kent area.' : 'Slot reserved.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {bookingConfirmed && (
                <div className="p-4 rounded-2xl bg-emerald-600 text-white border border-emerald-400 text-xs flex items-center gap-3 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white shrink-0" />
                  <div>
                    <p className="font-black text-white">Booking Slot Reserved!</p>
                    <p>Reserved <strong>{selectedSlot}</strong> on <strong>{bookingDate}</strong> for {bookingService}. Our team will call to confirm.</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Selected Slot: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{selectedSlot}</strong> on <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{bookingDate}</strong></span>
                </div>
                
                <button
                  onClick={() => navigate('/booking')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-lg text-xs flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-slate-950" />
                  <span>Open Full Booking Wizard</span>
                </button>
              </div>

            </div>
          </div>
        </section>

        <section id="why-us" className={`py-20 border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
              }`}>
                Why TK Services
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Why Choose Us for Your Property Care
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className={`p-6 rounded-2xl border text-left space-y-3 shadow-md ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Local Kent Expertise</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Based in Gravesend, serving Dartford, Medway & Kent with localized knowledge and fast response.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border text-left space-y-3 shadow-md ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Fast Quotes</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Same-day quote responses with transparent pricing and no hidden costs.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border text-left space-y-3 shadow-md ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Recycle className="w-6 h-6" />
                </div>
                <h4 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Eco-Friendly Disposal</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Environment Agency licensed waste carrier committed to legal eco-disposal & high recycling rates.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border text-left space-y-3 shadow-md ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Fully Insured</h4>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Comprehensive public liability insurance providing complete peace of mind.
                </p>
              </div>

            </div>
          </div>
        </section>

        <section id="reviews" className={`py-20 border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
              }`}>
                Customer Reviews
              </span>
              <h2 className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                What Our Clients Say Across Kent
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Mark Taylor',
                  location: 'Gravesend, Kent',
                  service: 'Horticultural & Fencing',
                  text: 'TK Services transformed our back garden. The paver laying and fencing were finished cleanly within two days. Highly recommended local team!',
                  rating: 5
                },
                {
                  name: 'Claire Watson',
                  location: 'Dartford, Kent',
                  service: 'Jet Washing & Clearance',
                  text: 'Fantastic driveway pressure wash and garden rubbish removal. Prompt phone response and transparent pricing. 07423 018166 was answered right away.',
                  rating: 5
                },
                {
                  name: 'David Reynolds',
                  location: 'Rochester, Medway',
                  service: 'Deep Cleaning & Lawn Care',
                  text: 'Regular lawn mowing and deep end-of-tenancy clean. Professional, friendly, and fully licensed. Wouldn’t use anyone else in Kent.',
                  rating: 5
                }
              ].map((review, i) => (
                <div key={i} className={`p-7 rounded-3xl border text-left space-y-4 shadow-xl ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className={`text-xs italic leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    "{review.text}"
                  </p>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{review.name}</p>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{review.location}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-500/30">
                      {review.service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer 
        onRequestQuote={() => navigate('/booking')}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

function AppRoutes({ isDarkMode, setIsDarkMode }) {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <LandingPage 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onRequestQuote={() => {}}
            currentUser={currentUser}
          />
        } 
      />
      <Route 
        path="/login" 
        element={<Login isDarkMode={isDarkMode} />} 
      />
      <Route 
        path="/signup" 
        element={<Signup isDarkMode={isDarkMode} />} 
      />
      <Route 
        path="/booking" 
        element={
          <ProtectedRoute>
            <QuoteWizard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} currentUser={currentUser} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/book" 
        element={
          <ProtectedRoute>
            <QuoteWizard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} currentUser={currentUser} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} currentUser={currentUser} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-login" 
        element={<AdminLogin isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} 
      />
      <Route 
        path="/admin/login" 
        element={<AdminLogin isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Admin isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} currentUser={currentUser} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <Admin isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} currentUser={currentUser} />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </BrowserRouter>
    </AuthProvider>
  );
}

