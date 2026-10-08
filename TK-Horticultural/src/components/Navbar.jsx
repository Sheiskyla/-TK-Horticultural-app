import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signOut } from '../firebase';
import {
  Phone,
  MessageSquare,
  Menu,
  X,
  Leaf,
  User,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar({ onRequestQuote, isDarkMode, onToggleDarkMode, currentUser }) {
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!isMobileMenuOpen) return;
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { id: 'home', label: 'Home', href: '/#home' },
    { id: 'services', label: 'Services', href: '/#services' },
    { id: 'gallery', label: 'Gallery', href: '/gallery' },
    { id: 'booking', label: 'Book Slot', href: '/booking' },
    { id: 'why-us', label: 'Why Choose Us', href: '/#why-us' },
    { id: 'reviews', label: 'Reviews', href: '/#reviews' },
  ];

  const handleNavClick = (id) => {
    setActiveLink(id);
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const tickerItems = [
    '🌿 Professional Gardening, Deep Cleaning & Waste Disposal in Gravesend, Kent',
    '📞 Call Direct: 07423 018166 / 07405 681878',
    '🛡️ Environment Agency Licensed Waste Carrier & Fully Insured',
    '💬 WhatsApp Us 24/7 for Fast Free Quotes & Instant Booking',
    '📍 Serving Gravesend, Dartford, Medway, Maidstone & All Kent',
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full max-w-full transition-all duration-300">
      <div
        className={`w-full overflow-hidden text-[11px] sm:text-xs py-1.5 sm:py-2 border-b relative font-semibold ${
          isDarkMode ? 'bg-emerald-950 text-emerald-200 border-emerald-900/50' : 'bg-emerald-700 text-white border-emerald-800 shadow-inner'
        }`}
      >
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 sm:gap-12">
          <div className="flex items-center gap-8 sm:gap-12 shrink-0">
            {tickerItems.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-8 sm:gap-12 shrink-0">
            {tickerItems.map((item, index) => (
              <span key={`dup-${index}`} className="inline-flex items-center gap-2">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <nav
        className={`w-full max-w-full transition-all duration-300 ${
          isDarkMode
            ? isScrolled
              ? 'bg-slate-950/95 backdrop-blur-md shadow-xl border-b border-slate-800 py-2 sm:py-2.5'
              : 'bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 py-2.5 sm:py-3.5'
            : isScrolled
              ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-2 sm:py-2.5'
              : 'bg-white/90 backdrop-blur-sm border-b border-slate-200/80 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3 min-h-[52px] lg:min-h-[64px]">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none shrink-0"
              onClick={() => handleNavClick('home')}
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
                <div className={`w-full h-full ${isDarkMode ? 'bg-slate-950' : 'bg-white'} rounded-[10px] flex items-center justify-center`}>
                  <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>

              <div className="flex min-w-0 flex-col text-left leading-none">
                <span className={`text-base sm:text-[1.75rem] font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  TK Services
                </span>
                <span className="hidden min-[381px]:block truncate text-[8px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 mt-1">
                  Horticultural, Cleaning & Waste
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="flex items-center gap-1 xl:gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 min-h-[44px] flex items-center whitespace-nowrap ${
                      activeLink === link.id
                        ? isDarkMode
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm'
                        : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`p-2.5 rounded-xl border shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={onRequestQuote}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-md flex items-center gap-1.5 min-h-[44px] whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Get Free Quote</span>
              </button>

              <a
                href="tel:07423018166"
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm min-h-[44px] whitespace-nowrap ${
                  isDarkMode
                    ? 'bg-slate-900 text-slate-100 border-slate-800'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-500/40'
                }`}
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-emerald-700 text-xs">07423 018166</span>
              </a>

              <a
                href="https://wa.me/447423018166"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-md min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {currentUser ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border min-h-[44px] ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[90px] truncate font-bold">{currentUser.displayName || currentUser.email.split('@')[0]}</span>
                  </button>

                  {showProfileMenu && (
                    <div className={`absolute right-0 mt-2 w-56 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl shadow-2xl p-2 z-[60]`}>
                      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.displayName || 'Client'}</p>
                        <p className="text-[10px] text-emerald-600 truncate">{currentUser.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className={`w-full mt-1 text-left px-3 py-2.5 text-xs rounded-lg flex items-center gap-2 font-bold min-h-[44px] ${
                          isDarkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                        <span>My Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full mt-1 text-left px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-bold min-h-[44px]"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all min-h-[44px] flex items-center whitespace-nowrap ${
                    isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600 inline mr-1.5" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`p-2.5 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-900 text-amber-400 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
                aria-label="Toggle theme mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <a
                href="tel:07423018166"
                className={`hidden min-[480px]:flex p-2.5 rounded-xl border min-h-[44px] min-w-[44px] items-center justify-center ${
                  isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'
                }`}
                aria-label="Call us"
              >
                <Phone className="w-5 h-5 text-emerald-600" />
              </a>

              <a
                href="https://wa.me/447423018166"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-[480px]:flex p-2.5 rounded-xl bg-emerald-600 text-white border border-emerald-500 min-h-[44px] min-w-[44px] items-center justify-center shadow-md"
                aria-label="WhatsApp us"
              >
                <MessageSquare className="w-5 h-5" />
              </a>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`p-2.5 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-900 text-slate-200 border-slate-800' : 'bg-white text-slate-800 border-slate-200'
                }`}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-emerald-600" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              type="button"
              aria-label="Close mobile menu overlay"
              className="absolute inset-0 z-0 bg-slate-950/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <aside
              ref={drawerRef}
              className={`absolute right-0 top-0 z-10 h-full w-[86%] max-w-sm overflow-y-auto overscroll-contain px-4 pt-4 pb-8 shadow-2xl border-l ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-md">
                    <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                      <Leaf className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">TK Services</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-600">Horticultural</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-emerald-600" />
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    to={link.href.startsWith('/') ? link.href : `/${link.href}`}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center justify-between w-full min-h-[44px] rounded-xl px-4 py-3 text-sm font-bold transition ${
                      activeLink === link.id
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isDarkMode
                          ? 'text-slate-200 hover:bg-slate-900'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onRequestQuote) onRequestQuote();
                  }}
                  className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-sm shadow-lg"
                >
                  Get a Free Quote
                </button>

                <a
                  href="tel:07423018166"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-bold text-sm ${
                    isDarkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Call Us (07423 018166)
                </a>

                <a
                  href="https://wa.me/447423018166"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Us
                </a>

                {currentUser ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-bold text-sm ${
                        isDarkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                      My Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-bold text-sm text-rose-600 bg-rose-50 border border-rose-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-bold text-sm ${
                      isDarkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-500" />
                    Login / Register
                  </Link>
                )}
              </div>
            </aside>
          </div>,
          document.body,
        )}
      </nav>
    </header>
  );
}
