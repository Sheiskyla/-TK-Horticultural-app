import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { 
  Leaf, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  MessageSquare, 
  AlertCircle, 
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  Home,
  CalendarPlus,
  ClipboardList,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  collection, doc, query, where, onSnapshot, runTransaction,
  writeBatch, setDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db, signOut } from '../firebase';
import { uploadMediaFile } from '../lib/uploadMediaFile';
import useDateAvailability, { BOOKING_SLOTS, isSlotAvailable, weekdayAvailabilityId } from '../hooks/useDateAvailability';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Dashboard({ isDarkMode, setIsDarkMode, currentUser }) {
  const navigate = useNavigate();
  const uid = currentUser?.uid;

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [bookingService, setBookingService] = useState('Horticultural & Landscaping');
  const [bookingDate, setBookingDate] = useState(todayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [jobLocation, setJobLocation] = useState('');
  const [jobDetails, setJobDetails] = useState('');
  const [jobFiles, setJobFiles] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [saving, setSaving] = useState(false);

  const [bookings, setBookings] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);
  const { dateSettings: selectedDateAvailability, weeklySettings: selectedWeekAvailability, loading: availabilityLoading, error: availabilityError } = useDateAvailability(bookingDate);
  const [profile, setProfile] = useState({ phone: '', address: '' });
  const [profileSaved, setProfileSaved] = useState(false);

  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [monthSlots, setMonthSlots] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const baseSlots = BOOKING_SLOTS.map((slot) => ({ id: slot.id, time: slot.label, field: slot.field }));

  const timeSlots = baseSlots.map((s) => ({
    ...s,
    status: takenSlots.includes(s.id)
      ? 'Booked'
      : !isSlotAvailable(selectedDateAvailability, selectedWeekAvailability, s.field)
        ? 'Unavailable'
        : 'Available'
  }));

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'bookings'), where('userId', '==', uid));
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => (b.date + b.slot).localeCompare(a.date + a.slot));
        setBookings(rows);
      },
      (err) => { console.error(err); setBookings([]); }
    );
  }, [uid]);

  useEffect(() => {
    const q = query(collection(db, 'slots'), where('date', '==', bookingDate));
    return onSnapshot(q, (snap) => setTakenSlots(snap.docs.map((d) => d.data().slotId)), (e) => console.error(e));
  }, [bookingDate]);

  useEffect(() => {
    const y = calMonth.getFullYear();
    const m = String(calMonth.getMonth() + 1).padStart(2, '0');
    const q = query(
      collection(db, 'slots'),
      where('date', '>=', `${y}-${m}-01`),
      where('date', '<=', `${y}-${m}-31`)
    );
    return onSnapshot(q, (snap) => setMonthSlots(snap.docs.map((d) => d.data())), (e) => console.error(e));
  }, [calMonth]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) setProfile((p) => ({ ...p, ...snap.data() }));
    });
  }, [uid]);

  const stats = useMemo(() => {
    const list = bookings || [];
    const live = list.filter((b) => b.status !== 'Cancelled' && b.status !== 'Completed');
    const upcoming = live.filter((b) => b.date >= todayStr());
    const counts = {};
    list.forEach((b) => { counts[b.service] = (counts[b.service] || 0) + 1; });
    const topService = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return { total: list.length, upcoming: upcoming.length, topService };
  }, [bookings]);

  const handleSignOut = async () => {
    try {
      if (uid) {
        setDoc(doc(db, 'users', uid), {
          uid,
          isOnline: false,
          lastActiveAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
      }
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const goTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setBookingConfirmed(false);
    setBookingError('');
  };

  const reserveSlot = async () => {
    const chosen = baseSlots.find((s) => s.time === selectedSlot);
    if (!chosen || !uid) return;
    if (availabilityLoading || availabilityError) {
      setBookingError('Availability is still loading or could not be checked. Please try again.');
      return;
    }

    const trimmedLocation = jobLocation.trim();
    const trimmedDetails = jobDetails.trim();
    if (!trimmedLocation) {
      setBookingError('Please add the job location so we can assess the site.');
      return;
    }
    if (!trimmedDetails) {
      setBookingError('Please describe the work you want us to carry out.');
      return;
    }

    setSaving(true);
    setBookingError('');
    setBookingConfirmed(false);

    const slotRef = doc(db, 'slots', `${bookingDate}_${chosen.id}`);
    const availabilityRef = doc(db, 'availability', bookingDate);
    const weeklyAvailabilityRef = doc(db, 'availability_defaults', weekdayAvailabilityId(bookingDate));
    const bookingRef = doc(collection(db, 'bookings'));
    try {
      const uploadedJobFiles = await Promise.all(jobFiles.map((file) => uploadMediaFile(
        file.file,
        `users/${uid}/bookings/${bookingRef.id}/${Date.now()}_${file.name.replace(/[^\w.-]/g, '_')}`
      )));
      await runTransaction(db, async (tx) => {
        const existing = await tx.get(slotRef);
        if (existing.exists()) throw new Error('SLOT_TAKEN');
        const availability = await tx.get(availabilityRef);
        const weeklyAvailability = await tx.get(weeklyAvailabilityRef);
        if (!isSlotAvailable(
          availability.exists() ? availability.data() : null,
          weeklyAvailability.exists() ? weeklyAvailability.data() : null,
          chosen.field
        )) {
          throw new Error('SLOT_UNAVAILABLE');
        }
        tx.set(slotRef, { date: bookingDate, slotId: chosen.id, userId: uid, createdAt: serverTimestamp() });
        tx.set(bookingRef, {
          userId: uid,
          customerName: currentUser?.displayName || '',
          customerEmail: currentUser?.email || '',
          ref: 'TK-' + Math.floor(100000 + Math.random() * 900000),
          service: bookingService,
          division: bookingService,
          date: bookingDate,
          slotId: chosen.id,
          slot: chosen.time,
          address: trimmedLocation,
          location: trimmedLocation,
          jobDetails: trimmedDetails,
          jobFiles: uploadedJobFiles,
          status: 'Pending Quote',
          createdAt: serverTimestamp()
        });
      });
      setBookingConfirmed(true);
      jobFiles.forEach((file) => file.preview && URL.revokeObjectURL(file.preview));
      setJobLocation('');
      setJobDetails('');
      setJobFiles([]);
    } catch (e) {
      setBookingError(
        e.message === 'SLOT_TAKEN'
          ? 'Someone just took that slot. Please pick another time.'
          : e.message === 'SLOT_UNAVAILABLE'
            ? 'This slot was marked unavailable. Please choose another time.'
          : 'Could not save your booking. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = (b) => setCancelTarget(b);

  const confirmCancel = async () => {
    const b = cancelTarget;
    if (!b) return;
    setCancelling(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'bookings', b.id), { status: 'Cancelled' });
      batch.delete(doc(db, 'slots', `${b.date}_${b.slotId}`));
      await batch.commit();
      setCancelTarget(null);
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  const saveProfile = async () => {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: currentUser?.email || '',
        displayName: currentUser?.displayName || '',
        phone: profile.phone,
        address: profile.address
      }, { merge: true });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJobFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const mapped = files
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map((file) => ({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      }));

    if (mapped.length === 0) {
      setBookingError('Please upload only images or videos for the job.');
      return;
    }

    setJobFiles((prev) => [...prev, ...mapped]);
    event.target.value = '';
  };

  const removeJobFile = (index) => {
    setJobFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'book', label: 'Book a Service', icon: CalendarPlus },
    { id: 'bookings', label: 'My Bookings & Quotes', icon: ClipboardList },
    { id: 'profile', label: 'Account Profile', icon: User },
  ];

  const initial = (currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase();

  // ---- Reusable blocks (your original markup) ----
  const bookingsList = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Active & Past Service Requests
        </h3>
        <button
          onClick={() => goTab('book')}
          className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>+ Book New Service</span>
        </button>
      </div>

      {bookings === null ? (
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <div className={`p-10 rounded-2xl border border-dashed text-center ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
        }`}>
          <ClipboardList className="w-9 h-9 mx-auto text-emerald-500" />
          <h4 className={`mt-3 text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No bookings yet</h4>
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Pick a service and a time slot to make your first booking.
          </p>
          <button
            onClick={() => navigate('/booking')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Get a Quote
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-full min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{b.ref}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'Confirmed'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                      : b.status === 'Pending Quote'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                      : b.status === 'Cancelled'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <h4 className={`text-sm font-bold break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.service}</h4>
                <div className={`flex flex-wrap items-center gap-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="flex min-w-0 items-start gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {b.date} ({b.slot})
                  </span>
                  {(b.location || b.address) && (
                    <span className="flex min-w-0 items-start gap-1 break-words">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {b.location || b.address}
                    </span>
                  )}
                </div>
                {b.jobDetails && (
                  <p className={`mt-2 text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="font-bold mr-1">Job details:</span>
                    {b.jobDetails.length > 140 ? `${b.jobDetails.slice(0, 140)}…` : b.jobDetails}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
                {b.price && (
                  <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.price}</span>
                )}
                <a
                  href={`https://wa.me/447423018166?text=${encodeURIComponent('Query regarding Booking Ref: ' + b.ref)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                {(b.status === 'Pending Quote' || b.status === 'Confirmed') && b.date >= todayStr() && (
                  <button
                    onClick={() => cancelBooking(b)}
                    className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 ${
                      isDarkMode ? 'border-slate-700 text-rose-400 hover:bg-rose-950/40' : 'border-slate-300 text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  const calY = calMonth.getFullYear();
  const calM = calMonth.getMonth();
  const pad2 = (n) => String(n).padStart(2, '0');
  const firstDow = (new Date(calY, calM, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();
  const isCurrentMonth = calY === new Date().getFullYear() && calM === new Date().getMonth();
  const takenPerDate = {};
  monthSlots.forEach((s) => { takenPerDate[s.date] = (takenPerDate[s.date] || 0) + 1; });

  const calendar = (
    <div className={`p-3 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={isCurrentMonth}
          onClick={() => setCalMonth(new Date(calY, calM - 1, 1))}
          aria-label="Previous month"
          className={`p-2 rounded-lg disabled:opacity-30 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {calMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setCalMonth(new Date(calY, calM + 1, 1))}
          aria-label="Next month"
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: firstDow }).map((_, i) => <span key={'e' + i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${calY}-${pad2(calM + 1)}-${pad2(day)}`;
          const isPast = dateStr < todayStr();
          const isFull = (takenPerDate[dateStr] || 0) >= baseSlots.length;
          const isSelected = dateStr === bookingDate;
          const isToday = dateStr === todayStr();
          const disabled = isPast || isFull;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => { setBookingDate(dateStr); setSelectedSlot(null); setBookingConfirmed(false); }}
              aria-label={`${dateStr}${isFull ? ' fully booked' : ''}`}
              className={`aspect-square min-w-0 rounded-lg text-[11px] sm:text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : isFull
                  ? 'text-amber-600 dark:text-amber-400 line-through opacity-70 cursor-not-allowed'
                  : isPast
                  ? 'text-slate-400 opacity-40 cursor-not-allowed'
                  : isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-900 hover:bg-emerald-100'
              } ${isToday && !isSelected ? 'ring-1 ring-emerald-500' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded ring-1 ring-emerald-500" /> Today</span>
        <span className="flex items-center gap-1"><span className="line-through text-amber-500">12</span> Fully booked</span>
      </div>
    </div>
  );


  const cancelModal = cancelTarget && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true">
      <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black">Cancel this booking?</h3>
        </div>
        <div className={`p-3 rounded-xl border text-xs space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <p className="font-black text-emerald-600 dark:text-emerald-400">{cancelTarget.ref}</p>
          <p className="font-bold">{cancelTarget.service}</p>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>{cancelTarget.date} ({cancelTarget.slot})</p>
        </div>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          The time slot will be released for other customers.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={() => setCancelTarget(null)}
            disabled={cancelling}
            className={`flex-1 py-3 rounded-xl border font-bold text-xs ${
              isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
            }`}
          >
            Keep booking
          </button>
          <button
            onClick={confirmCancel}
            disabled={cancelling}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50"
          >
            {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
          </button>
        </div>
      </div>
    </div>
  );

  const sidebar = (
    <div className={`h-full min-h-0 flex flex-col border-r ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div
        onClick={() => goTab('overview')}
        className="flex items-center gap-3 cursor-pointer select-none px-5 py-5"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
          TK
        </div>
        <div>
          <span className={`font-black text-lg tracking-tight block leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            TK Services
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-widest uppercase block mt-0.5">
            Client Dashboard
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => goTab(id)}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === id
                ? 'bg-emerald-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {id === 'bookings' && stats.upcoming > 0 && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/20">{stats.upcoming}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="shrink-0 p-3 space-y-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate('/')}
          className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-2 shadow-sm ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-750' 
              : 'bg-slate-100 border-slate-300 text-emerald-800 hover:bg-slate-200'
          }`}
          title="Go to Main Landing Page"
        >
          <Home className="w-4 h-4 text-emerald-500" />
          <span>Landing Page</span>
        </button>

        <button
          onClick={() => navigate('/booking')}
          className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-2 shadow-sm ${
            isDarkMode
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
          }`}
          title="Get a Quote"
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Get a Quote</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl border bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
            {initial}
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-black leading-tight text-slate-900 dark:text-white truncate">
              {currentUser?.displayName || 'Client'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {currentUser?.email || 'Logged In'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>

      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40">{sidebar}</aside>

      <header className={`lg:hidden sticky top-0 z-40 border-b shadow-md flex items-center justify-between px-4 py-3 ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-black text-lg">TK Services</span>
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
          {initial}
        </div>
      </header>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[85%] h-full overflow-y-auto overscroll-contain">{sidebar}</div>
          <button
            className="flex-1 bg-black/50"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6 text-white m-4" />
          </button>
        </div>
      )}

      {cancelModal}

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <main className="flex-grow min-w-0 py-5 px-3 sm:py-8 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* ---------- OVERVIEW ---------- */}
            {activeTab === 'overview' && (
              <>
                <div className={`p-4 sm:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 ${
                  isDarkMode ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
                      {initial}
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Client Portal</span>
                      <h1 className={`text-xl sm:text-3xl font-black break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Welcome, {currentUser?.displayName || 'Valued Client'}
                      </h1>
                      <p className={`text-xs break-all ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {currentUser?.email} • Account Active
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/booking')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg text-xs flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Get a Quote</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Bookings</span>
                      <Calendar className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className={`text-2xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {bookings === null ? '…' : stats.total}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-1">{stats.upcoming} upcoming</p>
                  </div>

                  <div className={`p-5 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Service Division</span>
                      <Leaf className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className={`text-lg font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {stats.topService || 'None yet'}
                    </p>
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

                <div className={`p-4 sm:p-8 rounded-3xl border shadow-xl text-left ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  {bookingsList}
                </div>
              </>
            )}

            {/* ---------- BOOK A SERVICE ---------- */}
            {activeTab === 'book' && (
              <div className={`p-4 sm:p-8 rounded-3xl border shadow-xl text-left space-y-6 sm:space-y-8 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                    isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                  }`}>
                    Interactive Slot Booking
                  </span>
                  <h2 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Reserve Your Preferred Service Slot
                  </h2>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Select your service, choose a date, and pick an available time slot. Availability updates live.
                  </p>
                </div>

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
                    {calendar}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      3. Job Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-500" />
                      <input
                        type="text"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        placeholder="Enter the property or site address"
                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border font-semibold text-xs focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      4. Upload Images / Videos
                    </label>
                    <label className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl border border-dashed cursor-pointer transition-all ${
                      isDarkMode ? 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800' : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}>
                      <Plus className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold">Choose files</span>
                      <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleJobFiles} />
                    </label>
                    {jobFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {jobFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                            isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              {file.type.startsWith('video/') ? (
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[10px] font-black">VID</div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[10px] font-black">IMG</div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold truncate max-w-[170px]">{file.name}</p>
                                <p className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{Math.max(1, Math.round(file.size / 1024))} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeJobFile(index)}
                              className="text-rose-500 hover:text-rose-400 transition-colors"
                              aria-label={`Remove ${file.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    5. Project Details
                  </label>
                  <textarea
                    value={jobDetails}
                    onChange={(e) => setJobDetails(e.target.value)}
                    rows={5}
                    placeholder="Tell us what work you want completed, the problem you're facing, or anything specific we should know before quoting."
                    className={`w-full px-4 py-3.5 rounded-xl border font-medium text-xs focus:outline-none focus:border-emerald-500 resize-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    6. Select Visual Time Slot
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {availabilityError && <p role="alert" className="text-xs text-rose-500">Could not load availability: {availabilityError.message}</p>}
                    {timeSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      const isAvailable = slot.status === 'Available';
                      const isUnavailable = !isAvailable;

                      return (
                        <button
                          type="button"
                          key={slot.id}
                          disabled={isUnavailable || availabilityLoading || Boolean(availabilityError)}
                          onClick={() => {
                            if (isAvailable) { setSelectedSlot(slot.time); setBookingConfirmed(false); }
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
                                {slot.status}
                              </span>
                            )}
                          </div>

                          <p className={`text-[11px] ${isSelected ? 'text-emerald-100' : isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {isAvailable ? 'Open slot for Gravesend / Kent area.' : slot.status === 'Booked' ? 'Slot already reserved.' : 'Unavailable by the service team.'}
                          </p>
                        </button>
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
                      <button onClick={() => goTab('bookings')} className="underline font-bold mt-1">View my bookings</button>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="p-4 rounded-2xl bg-rose-600 text-white text-xs flex items-center gap-3 shadow-lg">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{bookingError}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedSlot ? (
                      <span>Selected Slot: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{selectedSlot}</strong> on <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{bookingDate}</strong></span>
                    ) : (
                      <span>Choose a time slot to continue.</span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => navigate('/booking')}
                      className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black border text-xs flex items-center justify-center gap-2 ${
                        isDarkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span>Open Full Booking Wizard</span>
                    </button>

                    <button
                      onClick={reserveSlot}
                      disabled={!selectedSlot || saving}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-lg text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 text-slate-950" />
                      <span>{saving ? 'Reserving…' : 'Reserve This Slot'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- MY BOOKINGS ---------- */}
            {activeTab === 'bookings' && (
              <div className={`p-4 sm:p-8 rounded-3xl border shadow-xl text-left ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {bookingsList}
              </div>
            )}

            {/* ---------- PROFILE ---------- */}
            {activeTab === 'profile' && (
              <div className={`p-4 sm:p-8 rounded-3xl border shadow-xl text-left ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
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
                          value={currentUser?.displayName || ''}
                          placeholder="No name set"
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
                          value={currentUser?.email || ''}
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
                          value={profile.phone}
                          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="Your phone number"
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
                          value={profile.address}
                          onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                          placeholder="Where should we come?"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border font-bold ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={saveProfile}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      {profileSaved ? 'Saved' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        <Footer 
          onRequestQuote={() => goTab('book')}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}