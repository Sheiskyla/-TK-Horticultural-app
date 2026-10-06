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
  Code
} from 'lucide-react';

export default function Footer({ onRequestQuote, isDarkMode }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`relative pt-8 sm:pt-12 pb-8 border-t transition-colors duration-300 overflow-hidden ${isDarkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-200'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-300'
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
              Gravesend & Kent specialists in horticultural care, garden maintenance, property cleaning, and Environment Agency reliable waste removal.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className={`flex items-center gap-2 text-[11px] p-2 rounded-lg border ${isDarkMode ? 'text-slate-300 bg-slate-900 border-slate-800' : 'text-slate-700 bg-white border-slate-200'
                }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Fully Insured & Vetted Staff</span>
              </div>
              <div className={`flex items-center gap-2 text-[11px] p-2 rounded-lg border ${isDarkMode ? 'text-slate-300 bg-slate-900 border-slate-800' : 'text-slate-700 bg-white border-slate-200'
                }`}>
                <Recycle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Environment Agency Waste Carrier</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1.5 inline-block ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-slate-900 border-emerald-500/40'
              }`}>
              Our Services
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                'Horticulture & Landscape Care',
                'Lawn Mowing & Maintenance',
                'Domestic & Commercial Cleaning',
                'Reliable Waste Removal & Clearance',
                'Driveway & Patio Pressure Washing',
                'Fencing & Paver Laying'
              ].map((service, index) => (
                <li key={index} className={`flex items-center gap-2 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-medium'
                  }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 text-left">
            <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1.5 inline-block ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-slate-900 border-emerald-500/40'
              }`}>
              Service Areas
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              {['Gravesend', 'Dartford', 'Northfleet', 'Medway', 'Rochester', 'Chatham', 'Maidstone', 'All Kent'].map((area, i) => (
                <span key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                  <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{area}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-1.5 inline-block ${isDarkMode ? 'text-white border-emerald-500/30' : 'text-slate-900 border-emerald-500/40'
              }`}>
              Direct Contact
            </h4>

            <div className="space-y-2 text-xs">
              <a
                href="tel:07423018166"
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
                  }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-600 dark:text-emerald-300">07423 018166</span>
              </a>

              <a
                href="tel:07405681878"
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500'
                  }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-600 dark:text-emerald-300">07405 681878</span>
              </a>

              <a
                href="https://wa.me/447423018166"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>WhatsApp 24/7</span>
              </a>
            </div>
          </div>

        </div>

        <div className={`pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
          <div className="text-center md:text-left font-medium">
            <p>© {new Date().getFullYear()} TK Horticultural, Cleaning & Waste Services. All Rights Reserved. • <Link to="/admin-login" className="hover:text-emerald-500 font-bold transition-colors">Admin Portal</Link></p>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}>
            <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Designed & Developed by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Ayomhi codes</strong></span>
          </div>

          <button
            onClick={scrollToTop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400' : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-700 shadow-sm'
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
