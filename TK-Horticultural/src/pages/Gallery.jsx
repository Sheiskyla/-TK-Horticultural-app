import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const galleryItems = [
  {
    title: 'Horticulture & Landscaping',
    description: 'Garden maintenance, planting, hedges and outdoor improvements.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',
    alt: 'Green garden with landscaped plants',
    icon: Leaf,
  },
  {
    title: 'Cleaning Services',
    description: 'Deep cleaning and care for homes, offices and outdoor surfaces.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
    alt: 'Cleaning professional working indoors',
    icon: Sparkles,
  },
  {
    title: 'Waste Disposal',
    description: 'Garden waste and general rubbish clearance with responsible disposal.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80',
    alt: 'Recycling containers representing responsible waste disposal',
    icon: Trash2,
  },
];

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
              Explore our horticultural, cleaning and waste-disposal services across Gravesend and Kent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {galleryItems.map(({ title, description, image, alt, icon: Icon }) => (
              <article
                key={title}
                className={`overflow-hidden rounded-2xl border shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {title}
                    </h2>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className={`mt-5 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            These are illustrative service images, not photos of completed TK Services projects.
          </p>

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
      </main>

      <Footer onRequestQuote={() => navigate('/booking')} isDarkMode={isDarkMode} />
    </div>
  );
}
