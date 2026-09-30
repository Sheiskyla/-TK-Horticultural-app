import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signOut } from '../firebase';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  MessageSquare, 
  FileText, 
  LogOut, 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Leaf, 
  Sparkles, 
  Trash2, 
  Home, 
  LayoutDashboard,
  Filter,
  Check,
  X,
  Search,
  DollarSign,
  Sun,
  Moon
} from 'lucide-react';

export default function Admin({ isDarkMode, setIsDarkMode, currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [filterDivision, setFilterDivision] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [bookings, setBookings] = useState([
    {
      id: 'TK-849201',
      clientName: 'Sarah Jenkins',
      clientEmail: 'sarah.j@example.com',
      clientPhone: '07423 018166',
      service: 'Horticultural & Lawn Maintenance',
      division: 'Horticulture',
      date: '2026-09-28',
      slot: '9am–12pm',
      status: 'Confirmed',
      address: '14 High Street, Gravesend, Kent',
      price: '£85.00',
      notes: 'Front lawn mowing & hedge pruning requested.'
    },
    {
      id: 'TK-731920',
      clientName: 'Mark Taylor',
      clientEmail: 'mark.t@example.com',
      clientPhone: '07405 681878',
      service: 'Driveway Jet Washing & Patio Clean',
      division: 'Cleaning',
      date: '2026-10-02',
      slot: '12pm–3pm',
      status: 'Pending Quote',
      address: '28 Station Road, Dartford, Kent',
      price: '£120.00',
      notes: 'Pressure washing for 2-car driveway.'
    },
    {
      id: 'TK-610482',
      clientName: 'Claire Watson',
      clientEmail: 'claire.w@example.com',
      clientPhone: '07423 018166',
      service: 'Garden Waste Clearance & Disposal',
      division: 'Waste',
      date: '2026-09-15',
      slot: '3pm–6pm',
      status: 'Completed',
      address: '7 London Road, Rochester, Medway',
      price: '£65.00',
      notes: 'Branch cuttings & green waste clearance.'
    }
  ]);

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const handleAdminSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesDivision = filterDivision === 'all' || b.division.toLowerCase() === filterDivision.toLowerCase();
    const matchesSearch = b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDivision && matchesSearch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-emerald-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <header className={`sticky top-0 z-40 border-b shadow-md transition-colors ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
              TK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg sm:text-xl tracking-tight block leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  TK Services
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Admin Console
                </span>
              </div>
              <span className={`text-[10px] font-semibold tracking-wider block mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Gravesend & Kent Operational Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsDarkMode && setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <Link
              to="/"
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 shadow-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              }`}
              title="Go to Main Website"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Website</span>
            </Link>

            <button
              onClick={handleAdminSignOut}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md"
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
            isDarkMode 
              ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-slate-800' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                <ShieldCheck className="w-8 h-8 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Verified Management Access</span>
                </div>
                <h1 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Administrator Control Panel
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {currentUser?.email || 'admin@tkhorticultural.co.uk'} • Full System Privileges
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/booking')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Create Booking Slot</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Booking Requests</span>
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <p className={`text-3xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bookings.length}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">1 Pending Confirmation</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Quoted Value Total</span>
                <TrendingUp className="w-5 h-5 text-teal-500" />
              </div>
              <p className={`text-3xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>£270.00</p>
              <p className="text-[10px] text-teal-600 dark:text-teal-300 font-bold mt-1">Across 3 Active Service Jobs</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Environment Waste Carrier</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">Active License</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Kent Environment Agency Verified</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Primary Contact Phone</span>
                <Phone className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">07423 018166</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dispatch & Support Hotline</p>
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl text-left space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Booking Requests & Quotes
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === 'services' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Services & Pricing Rates
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search client, ID, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className={`w-full sm:w-auto px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="all">All Service Divisions</option>
                  <option value="horticulture">Horticulture</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="waste">Waste Clearance</option>
                </select>
              </div>
            </div>

            {activeTab === 'requests' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Service Booking Requests ({filteredBookings.length})
                  </h3>
                </div>

                <div className="space-y-4">
                  {filteredBookings.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed text-center text-slate-400 text-xs">
                      No service requests match your search criteria.
                    </div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div key={b.id} className={`p-5 rounded-2xl border space-y-4 shadow-md ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{b.id}</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                                : b.status === 'Pending Quote'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                            }`}>
                              {b.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                              {b.division}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(b.id, 'Confirmed')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'Completed')}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'Cancelled')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Client Information</span>
                            <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.clientName}</p>
                            <p className="text-slate-500 dark:text-slate-400">{b.clientEmail}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{b.clientPhone}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Service & Schedule</span>
                            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.service}</p>
                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                              {b.date} ({b.slot})
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              {b.address}
                            </p>
                          </div>

                          <div className="space-y-2 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">Quote Estimate</span>
                              <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.price}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">"{b.notes}"</p>
                            </div>

                            <a
                              href={`https://wa.me/447423018166?text=Hello ${b.clientName}, regarding your TK Services booking ref: ${b.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-white" />
                              <span>Contact Client via WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  TK Services Divisions & Pricing Rates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className={`p-6 rounded-2xl border space-y-4 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Horticulture & Gardening</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lawn mowing, fencing, paver laying & hedge care.</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Standard Rate: From £45.00
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border space-y-4 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cleaning Services</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pressure jet washing, carpet care & deep cleaning.</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      Standard Rate: From £60.00
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border space-y-4 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Rubbish & Waste Clearance</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Environment Agency licensed eco-friendly disposal.</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Standard Rate: From £55.00
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}
