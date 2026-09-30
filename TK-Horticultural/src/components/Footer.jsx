import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  ChevronUp, 
  CheckCircle2, 
  Recycle, 
  Code,
  Zap
} from 'lucide-react';

export default function Footer({ onRequestQuote, isDarkMode }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`relative pt-8 sm:pt-12 pb-8 border-t transition-colors duration-300 overflow-hidden ${
      isDarkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className={`mb-10 sm:mb-12 p-5 sm:p-8 rounded-3xl border shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-emerald-500/30 text-white' 
            : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 border-emerald-600 text-white'
        }`}>
          <div className="text-center lg:text-left space-y-2 max-w-xl">
            <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              isDarkMode 
                ? 'text-emerald-300 bg-emerald-950 border-emerald-500/40' 
                : 'text-emerald-900 bg-emerald-100 border-emerald-300'
            }`}>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Fast Local Response in Gravesend & Kent
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Need Urgent Clearance, Gardening or Jet Washing?
            </h3>
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-emerald-50'}`}>
              Tap below to call our lead technicians directly or chat on WhatsApp for immediate advice and fast free estimates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <a
              href="tel:07423018166"
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <Phone className="w-4 h-4 text-slate-950" />
              <span>Call 07423 018166</span>
            </a>

            <a
              href="tel:07405681878"
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call 07405 681878</span>
            </a>

            <a
              href="https://wa.me/447423018166"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b ${
          isDarkMode ? 'border-slate-800' : 'border-slate-300'
        }`}>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shrink-0">
                <Leaf className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>TK Services</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                  Horticultural & Cleaning
                </span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Gravesend & Kent specialists in horticultural care, garden maintenance, property cleaning, and Environment Agency licensed waste removal.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className={`flex items-center gap-2 text-[11px] p-2 rounded-lg border ${
                isDarkMode ? 'text-slate-300 bg-slate-900 border-slate-800' : 'text-slate-700 bg-white border-slate-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Fully Insured & Vetted Staff</span>
              </div>
              <div className={`flex items-center gap-2 text-[11px] p-2 rounded-lg border ${
                isDarkMode ? 'text-slate-300 bg-slate-900 border-slate-800' : 'text-slate-700 bg-white border-slate-200'
              }`}>
                <Recycle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Environment Agency Waste Carrier</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1.5 inline-block ${
              isDarkMode ? 'text-white border-emerald-500/30' : 'text-slate-900 border-emerald-500/40'
            }`}>
              Our Services
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                'Horticulture & Landscape Care',
                'Lawn Mowing & Maintenance',
                'Domestic & Commercial Cleaning',
                'Licensed Waste Removal & Clearance',
                'Driveway & Patio Pressure Washing',
                'Fencing & Paver Laying'
              ].map((service, index) => (
                <li key={index} className={`flex items-center gap-2 transition-colors ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1.5 inline-block ${
              isDarkMode ? 'text-white border-emerald-500/30' : 'text-slate-900 border-emerald-500/40'
            }`}>
              Service Areas
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              {['Gravesend', 'Dartford', 'Northfleet', 'Medway', 'Rochester', 'Chatham', 'Maidstone', 'All Kent'].map((area, i) => (
                <span key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{area}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1.5 inline-block ${
              isDarkMode ? 'text-white border-emerald-500/30' : 'text-slate-900 border-emerald-500/40'
            }`}>
              Direct Contact
            </h4>
            
            <div className="space-y-2 text-xs">
              <a 
                href="tel:07423018166" 
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-600 dark:text-emerald-300">07423 018166</span>
              </a>

              <a 
                href="tel:07405681878" 
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-600 dark:text-emerald-300">07405 681878</span>
              </a>

              <a 
                href="https://wa.me/447423018166" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border font-bold ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>WhatsApp 24/7</span>
              </a>
            </div>
          </div>

        </div>

        <div className={`pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${
          isDarkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <div className="text-center md:text-left font-medium">
            <p>© {new Date().getFullYear()} TK Horticultural, Cleaning & Waste Services. All Rights Reserved. • <Link to="/admin-login" className="hover:text-emerald-500 font-bold transition-colors">Admin Portal</Link></p>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
          }`}>
            <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Designed & Developed by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Ayomhi codes</strong></span>
          </div>

          <button
            onClick={scrollToTop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400' : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 shadow-sm'
            }`}
          >
            <span>Back to top</span>
            <ChevronUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>

      </div>
    </footer>
  );
}
