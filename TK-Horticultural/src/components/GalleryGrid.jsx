import useFirestoreCollection from '../hooks/useFirestoreCollection';

export default function GalleryGrid({ isDarkMode, compact = false }) {
  const { documents, loading, error } = useFirestoreCollection('gallery');
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md';
  const secondaryText = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <section className={`${compact ? '' : 'py-16'} ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!compact && (
          <div className="mb-10 text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
              TK Services Showcase
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Recent Projects & Work Highlights
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto ${secondaryText}`}>
              Explore actual photos and video clips of our gardening, deep cleaning, and rubbish removal projects across Gravesend and Kent.
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="mb-6 text-center text-xs font-bold text-rose-500 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
            Gallery data feed notice: {error.message}
          </p>
        )}

        {loading ? (
          <p className={`text-center text-sm font-semibold ${secondaryText}`}>Loading live media gallery…</p>
        ) : documents.length === 0 ? (
          <p className={`text-center text-sm font-medium ${secondaryText}`}>
            Our team will be publishing project photos and videos here shortly.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((item) => {
              const isVideo = item.type === 'video' || item.mediaType === 'video' || item.url?.match(/\.(mp4|webm|ogg)(\?|$)/i);

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-3xl border transition-all duration-300 hover:border-emerald-500/50 ${cardBg}`}
                >
                  {isVideo ? (
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      className="aspect-[4/3] w-full bg-black object-cover"
                      aria-label={item.title || item.caption || 'TK Services gallery video'}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || item.category || 'TK Services project photo'}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  )}
                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
                      {item.category || 'Horticultural'}
                    </span>
                    <h3 className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {item.title || 'Property Project'}
                    </h3>
                    {(item.caption || item.description) && (
                      <p className={`text-xs leading-relaxed ${secondaryText}`}>
                        {item.caption || item.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
