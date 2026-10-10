import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadMediaFile } from '../lib/uploadMediaFile';
import useDateAvailability, { BOOKING_SLOTS, isSlotAvailable, weekdayAvailabilityId } from '../hooks/useDateAvailability';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Leaf, 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Upload, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  FileText, 
  LayoutDashboard
} from 'lucide-react';

export default function QuoteWizard({ isDarkMode, setIsDarkMode, currentUser }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [address, setAddress] = useState('');
  const [jobNotes, setJobNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [contactName, setContactName] = useState(currentUser?.displayName || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [estimatedBudget, setEstimatedBudget] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [slotReservations, setSlotReservations] = useState([]);
  const { dateSettings, weeklySettings, loading: availabilityLoading, error: availabilityError } = useDateAvailability(bookingDate);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceCategories = [
    {
      category: 'Horticultural & Landscaping',
      icon: Leaf,
      items: [
        'Lawn mowing',
        'Land levelling',
        'Lawn establishment',
        'Fencing installation & repair',
        'Paver laying & patio stones',
        'Hedge planting & pruning',
        'General garden maintenance'
      ]
    },
    {
      category: 'Cleaning Services',
      icon: Sparkles,
      items: [
        'Carpet washing & extraction',
        'Deep cleaning for properties',
        'Residential cleaning',
        'Office cleaning',
        'Jet / pressure washing (driveways & patios)'
      ]
    },
    {
      category: 'Rubbish & Waste Disposal',
      icon: Trash2,
      items: [
        'Rubbish removal & clearance',
        'Garden waste removal',
        'General waste clearance',
        'Eco waste disposal & recycling'
      ]
    }
  ];

  const baseTimeSlots = BOOKING_SLOTS.map((slot) => ({ id: slot.id, field: slot.field, time: slot.label }));
  const timeSlots = baseTimeSlots.map((slot) => ({
    ...slot,
    status: slotReservations.includes(slot.id)
      ? 'Booked'
      : !isSlotAvailable(dateSettings, weeklySettings, slot.field)
        ? 'Unavailable'
        : 'Available'
  }));

  React.useEffect(() => {
    const reservationsQuery = query(collection(db, 'slots'), where('date', '==', bookingDate));
    const unsubscribeReservations = onSnapshot(
      reservationsQuery,
      (snapshot) => setSlotReservations(snapshot.docs.map((item) => item.data().slotId)),
      (error) => console.error('Unable to load booked slots:', error)
    );
    return () => unsubscribeReservations();
  }, [bookingDate]);

  const handleServiceToggle = (item) => {
    if (selectedServices.includes(item)) {
      setSelectedServices(selectedServices.filter(s => s !== item));
    } else {
      setSelectedServices([...selectedServices, item]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      setUploadedFiles((current) => [...current, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    const updated = [...uploadedFiles];
    if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setUploadedFiles(updated);
  };

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    if (availabilityLoading || availabilityError) {
      setSubmitError('Availability is still loading or could not be checked. Please try again.');
      return;
    }
    if (!currentUser?.uid || !selectedSlot) {
      setSubmitError('Choose an available time slot before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    const refCode = `TK-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const bookingDocument = doc(collection(db, 'bookings'));
    const quoteDocument = doc(collection(db, 'quotes'));
    const chosen = baseTimeSlots.find((slot) => slot.time === selectedSlot);

    try {
      const attachments = await Promise.all(uploadedFiles.map(({ file }) => uploadMediaFile(
        file,
        `users/${currentUser.uid}/quotes/${quoteDocument.id}/${Date.now()}_${file.name.replace(/[^\w.-]/g, '_')}`
      )));
      await runTransaction(db, async (transaction) => {
        const reservationRef = doc(db, 'slots', `${bookingDate}_${chosen.id}`);
        const availabilityRef = doc(db, 'availability', bookingDate);
        const weeklyAvailabilityRef = doc(db, 'availability_defaults', weekdayAvailabilityId(bookingDate));
        const reservation = await transaction.get(reservationRef);
        const settings = await transaction.get(availabilityRef);
        const weeklySettingsSnapshot = await transaction.get(weeklyAvailabilityRef);
        if (reservation.exists()) throw new Error('SLOT_TAKEN');
        if (!isSlotAvailable(
          settings.exists() ? settings.data() : null,
          weeklySettingsSnapshot.exists() ? weeklySettingsSnapshot.data() : null,
          chosen.field
        )) throw new Error('SLOT_UNAVAILABLE');

        const common = {
          userId: currentUser.uid,
          customerName: contactName.trim(),
          customerEmail: contactEmail.trim(),
          customerPhone: contactPhone.trim(),
          ref: refCode,
          service: selectedServices.join(', '),
          date: bookingDate,
          slotId: chosen.id,
          slot: chosen.time,
          address: address.trim(),
          jobDetails: jobNotes.trim(),
          attachments,
          createdAt: serverTimestamp()
        };
        transaction.set(reservationRef, {
          date: bookingDate,
          slotId: chosen.id,
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
        transaction.set(bookingDocument, { ...common, status: 'Pending Quote' });
        transaction.set(quoteDocument, {
          ...common,
          requestedServices: selectedServices,
          requestedDate: bookingDate,
          requestedSlot: chosen.time,
          estimatedBudget: estimatedBudget ? Number(estimatedBudget) : null,
          status: 'New'
        });
      });
      setBookingRef(refCode);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Unable to submit the booking and quote request:', error);
      setSubmitError(error.message === 'SLOT_TAKEN' || error.message === 'SLOT_UNAVAILABLE'
        ? 'That time slot is no longer available. Please choose another slot.'
        : error.message || 'Could not submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const text = `*New Quote & Booking Request - TK Services*
Ref: ${bookingRef || 'TK-PENDING'}
*Name:* ${contactName || 'Client'}
*Phone:* ${contactPhone || 'N/A'}
*Email:* ${contactEmail || 'N/A'}
*Address:* ${address || 'Gravesend, Kent'}
*Date Requested:* ${bookingDate} (${selectedSlot})
*Selected Services:*
${selectedServices.length > 0 ? selectedServices.map(s => `• ${s}`).join('\n') : '• General Property Service'}
*Job Details:* ${jobNotes || 'N/A'}
*Media Uploaded:* ${uploadedFiles.length} file(s)`;

    return `https://wa.me/447423018166?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-emerald-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar 
        onRequestQuote={() => setCurrentStep(1)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
      />

      <main className="flex-grow min-w-0 py-5 sm:py-10 px-3 sm:px-6 lg:px-8 pb-28 md:pb-12">
        <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                isDarkMode ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
              }`}>
                Interactive Booking Wizard
              </span>
              <h1 className={`text-xl sm:text-3xl font-black break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Request a Quote & Book Service Slot
              </h1>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-950" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
              {[
                { step: 1, title: '1. Services' },
                { step: 2, title: '2. Date & Time' },
                { step: 3, title: '3. Details & Photos' },
                { step: 4, title: '4. Summary' }
              ].map((s) => (
                <div 
                  key={s.step} 
                  onClick={() => setCurrentStep(s.step)}
                  className={`py-3 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                    currentStep === s.step
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : currentStep > s.step
                      ? isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-800'
                      : isDarkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.step ? <CheckCircle className="w-4 h-4 shrink-0" /> : null}
                  <span className="truncate text-[11px] sm:text-xs">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {isSubmitted ? (
            <div className={`p-4 sm:p-12 rounded-3xl border shadow-2xl text-center space-y-6 max-w-2xl mx-auto ${
              isDarkMode ? 'bg-slate-900 border-emerald-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-emerald-500 tracking-wider">Booking Request Confirmed</span>
                <h2 className="text-xl sm:text-3xl font-black break-words">Thank You, {contactName || 'Client'}!</h2>
                <p className="text-xs text-slate-400">
                  Your request reference ID: <strong className="text-emerald-500 font-bold">{bookingRef}</strong>
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border text-left text-xs space-y-2 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="font-bold text-sm">Booking Overview:</p>
                <p className="break-words">• <strong>Selected Services:</strong> {selectedServices.join(', ') || 'General Service'}</p>
                <p>• <strong>Requested Date & Slot:</strong> {bookingDate} ({selectedSlot})</p>
                <p>• <strong>Address:</strong> {address || 'Gravesend, Kent'}</p>
                <p>• <strong>Phone Contact:</strong> {contactPhone || '07423 018166'}</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 text-xs shadow-lg min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Quote Directly via WhatsApp</span>
                </a>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition-all text-xs flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-950" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-4 sm:p-10 rounded-3xl border shadow-2xl text-left ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Step 1 of 4</span>
                    <h2 className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Select Required Services</h2>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Check all gardening, deep cleaning, pressure washing, or waste removal services you need.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {serviceCategories.map((cat, idx) => {
                      const IconComponent = cat.icon;
                      return (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {cat.category}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            {cat.items.map((item, itemIdx) => {
                              const isChecked = selectedServices.includes(item);
                              return (
                                <label
                                  key={itemIdx}
                                  className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all min-h-[44px] ${
                                    isChecked
                                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                                      : isDarkMode 
                                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700' 
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleServiceToggle(item)}
                                    className="sr-only"
                                  />
                                  <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                    isChecked ? 'bg-white text-emerald-600 border-white' : 'border-slate-400'
                                  }`}>
                                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </div>
                                  <span className="leading-snug">{item}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={selectedServices.length === 0}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      <span>Continue to Date & Time</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Step 2 of 4</span>
                    <h2 className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Choose Date & Time Slot</h2>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Select your preferred service date and inspect real-time available time slots.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Service Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toLocaleDateString('en-CA')}
                        value={bookingDate}
                        onChange={(e) => {
                          setBookingDate(e.target.value);
                          setSelectedSlot(null);
                        }}
                        className={`w-full px-4 py-3.5 rounded-xl border font-bold text-xs focus:outline-none focus:border-emerald-500 min-h-[44px] ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        Available Daily Slots
                      </label>

                      <div className="flex flex-col md:flex-row md:grid md:grid-cols-3 gap-3">
                        {availabilityError && <p role="alert" className="text-xs text-rose-500">Availability could not be loaded: {availabilityError.message}</p>}
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
                                if (isAvailable) setSelectedSlot(slot.time);
                              }}
                              className={`w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between min-h-[52px] ${
                                isUnavailable
                                  ? 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                                  : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-400'
                              }`}
                            >
                              <span className="flex items-center gap-2 text-xs font-extrabold">
                                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                                {slot.time}
                              </span>

                              {isUnavailable ? (
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {slot.status}
                                </span>
                              ) : (
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                                  isSelected ? 'bg-white text-emerald-700' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                                }`}>
                                  Available
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold border text-xs flex items-center justify-center gap-2 min-h-[44px] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedSlot}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all text-xs flex items-center justify-center gap-2 shadow-md min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Details & Photos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Step 3 of 4</span>
                    <h2 className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Job Details & Media Upload</h2>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Provide property address details, notes, and upload photos/videos of the job site.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Property Address & Postcode
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 14 High Street, Gravesend, Kent, DA11 0AA"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 min-h-[44px] ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Job Description & Instructions
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the job size, access points, garden height, or specific items to clear..."
                        value={jobNotes}
                        onChange={(e) => setJobNotes(e.target.value)}
                        className={`w-full px-4 py-3.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 min-h-[80px] ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      ></textarea>
                    </div>

                    <div>
                      <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Upload Job Site Photos or Videos
                      </label>
                      <div className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center relative ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                      }`}>
                        <input 
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full min-h-[100px]"
                        />
                        <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className={`font-bold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Drag & Drop photos/videos here or tap to browse</p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, MP4 files up to 25MB each.</p>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 min-h-[44px] ${
                              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                            }`}>
                              <div className="flex items-center gap-2 overflow-hidden">
                                {file.preview ? (
                                  <img src={file.preview} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                                ) : (
                                  <FileText className="w-6 h-6 text-emerald-500 shrink-0" />
                                )}
                                <div className="truncate">
                                  <p className="font-bold text-[11px] truncate">{file.name}</p>
                                  <p className="text-[9px] text-slate-400">{file.size}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="p-2 rounded-full text-slate-400 hover:text-rose-500 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold border text-xs flex items-center justify-center gap-2 min-h-[44px] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      onClick={() => setCurrentStep(4)}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all text-xs flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                    >
                      <span>Continue to Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Step 4 of 4</span>
                    <h2 className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Contact & Review Summary</h2>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Verify your quote request details and enter contact info to submit.
                    </p>
                  </div>

                  <form onSubmit={handleWizardSubmit} className="space-y-4 text-xs">
                    {submitError && (
                      <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-rose-600 dark:text-rose-300">
                        {submitError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Sarah Jenkins"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className={`w-full px-4 py-3.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 min-h-[44px] ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="07423 018166"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className={`w-full px-4 py-3.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 min-h-[44px] ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="sarah@example.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className={`w-full px-4 py-3.5 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 min-h-[44px] ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h4 className="font-bold text-sm">Request Summary:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <p>• <strong>Services:</strong> {selectedServices.join(', ') || 'None selected'}</p>
                        <p>• <strong>Schedule:</strong> {bookingDate} ({selectedSlot})</p>
                        <p>• <strong>Address:</strong> {address || 'Not specified'}</p>
                        <p>• <strong>Photos Uploaded:</strong> {uploadedFiles.length} file(s)</p>
                      </div>
                      <label className="block">
                        <span className={`block font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Estimated budget (optional)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={estimatedBudget}
                          onChange={(event) => setEstimatedBudget(event.target.value)}
                          placeholder="e.g. 150"
                          className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none focus:border-emerald-500 ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </label>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold border text-xs flex items-center justify-center gap-2 min-h-[44px] ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 transition-all text-xs flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
                      >
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>{isSubmitting ? 'Submitting…' : 'Confirm & Submit Booking Request'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer onRequestQuote={() => setCurrentStep(1)} isDarkMode={isDarkMode} />
    </div>
  );
}
