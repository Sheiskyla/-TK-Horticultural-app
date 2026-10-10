import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GalleryGrid from '../components/GalleryGrid';

export default function Gallery({ isDarkMode, setIsDarkMode, currentUser }) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col font-sans ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar
        onRequestQuote={() => navigate('/booking')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
      />

      <main className="flex-grow pt-[100px] sm:pt-[110px] lg:pt-[120px] pb-16 sm:pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-10 sm:mb-14 text-center space-y-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
              isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
            }`}>
              Our Gallery
            </span>
            <h1 className={`text-3xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              A Look at the Work We Do
            </h1>
            <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Explore photos and videos of our horticultural, cleaning and waste-disposal work across Gravesend and Kent.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-black text-slate-950 shadow-md transition-colors hover:bg-emerald-400"
            >
              Get a Free Quote
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <div className="mt-8">
          <GalleryGrid isDarkMode={isDarkMode} compact />
        </div>
      </main>

      <Footer onRequestQuote={() => navigate('/booking')} isDarkMode={isDarkMode} />
    </div>
  );
}
