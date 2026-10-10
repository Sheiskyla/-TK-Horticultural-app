import React, { useCallback, useEffect, useMemo, useRef, useState, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc, writeBatch
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import {
  CalendarDays, Check, CheckCheck, Clock3, Image as ImageIcon, LayoutDashboard, LogOut,
  Mail, MessageSquare, Search, ShieldCheck, Trash2, Users, X, Sun, Moon, Loader2,
  Upload, AlertTriangle, Sparkles, UserCheck, Shield, RefreshCw, KeyRound, Ban, UserX,
  ExternalLink, ChevronLeft, ChevronRight, UserPlus, Filter, CheckCircle2
} from 'lucide-react';
import { auth, db, signOut, storage, sendPasswordResetEmail } from '../firebase';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { BOOKING_SLOTS, isSlotAvailable, weekdayAvailabilityId } from '../hooks/useDateAvailability';
import { uploadMediaFile } from '../lib/uploadMediaFile';
import { ADMIN_EMAILS } from '../lib/adminAccess';
import {
  syncAllUsersCallable,
  setUserDisabledCallable,
  deleteUserAccountCallable,
  sendPasswordResetCallable,
  setAdminRoleCallable
} from '../lib/adminFunctions';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'availability', label: 'Availability', icon: Clock3 },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
];

const BOOKING_STATUS_OPTIONS = [
  'All statuses', 'Pending', 'Pending Quote', 'Approved', 'Confirmed', 'Declined', 'Completed', 'Cancelled'
];

const CONSOLE_USERS_SEED = [
  {
    id: 'WaUsxFvlE1gsTR8syWLFXv6O',
    uid: 'WaUsxFvlE1gsTR8syWLFXv6O',
    email: 'tkhorticulture@gmail.com',
    displayName: 'Administrator',
    role: 'admin',
    createdAt: new Date('2026-10-09T19:15:00Z'),
    disabled: false,
    providers: ['password']
  },
  {
    id: 'Ds09PLSB7VOwLIKBn4pUhM',
    uid: 'Ds09PLSB7VOwLIKBn4pUhM',
    email: 'judahk065@gmail.com',
    displayName: 'Judah K',
    role: 'client',
    createdAt: new Date('2026-10-05T12:00:00Z'),
    disabled: false,
    providers: ['google.com']
  },
  {
    id: 'PdZqVKouQjYHO4K6VABiWUf',
    uid: 'PdZqVKouQjYHO4K6VABiWUf',
    email: 'olabayoemmanuel@gmail.com',
    displayName: 'Olabayo Emmanuel',
    role: 'client',
    createdAt: new Date('2026-10-02T12:00:00Z'),
    disabled: false,
    providers: ['google.com']
  },
  {
    id: 'Uas9Zifi6NSOM4e6GQ4Ooncj',
    uid: 'Uas9Zifi6NSOM4e6GQ4Ooncj',
    email: 'ajewoleayomide386@gmail.com',
    displayName: 'Ajewole Ayomide',
    role: 'client',
    createdAt: new Date('2026-10-09T12:00:00Z'),
    disabled: false,
    providers: ['google.com']
  },
  {
    id: 'jbp5nZHDTONGaP24b32ROj9',
    uid: 'jbp5nZHDTONGaP24b32ROj9',
    email: 'ajewoleadeola386@gmail.com',
    displayName: 'Ajewole Adeola',
    role: 'client',
    createdAt: new Date('2026-09-30T12:00:00Z'),
    disabled: false,
    providers: ['google.com']
  }
];

function dateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDate(value) {
  if (!value) return '—';
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function clientName(booking) {
  return booking?.customerName || booking?.clientName || booking?.displayName || 'Customer';
}

function isUserActive(user, now) {
  if (!user) return false;
  const currentUid = auth.currentUser?.uid;
  const currentEmail = auth.currentUser?.email?.toLowerCase();
  
  if (currentUid && ((user.id && user.id === currentUid) || (user.uid && user.uid === currentUid))) {
    return true;
  }
  if (currentEmail && user.email && user.email.toLowerCase() === currentEmail) {
    return true;
  }

  const lastActiveAt = user.lastActiveAt?.toDate
    ? user.lastActiveAt.toDate().getTime()
    : new Date(user.lastActiveAt || 0).getTime();
  const age = now - lastActiveAt;
  return (user.isOnline === true || (Number.isFinite(lastActiveAt) && age >= 0 && age <= 300_000));
}

function isCreatedThisWeek(createdAt) {
  if (!createdAt) return false;
  const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

function getUserRole(usr, adminUidsSet) {
  if (!usr) return 'Client';
  const email = String(usr.email || '').toLowerCase().trim();
  const userId = usr.uid || usr.id;
  if (ADMIN_EMAILS.includes(email) || usr.role === 'admin' || (userId && adminUidsSet && adminUidsSet.has(userId))) {
    return 'Admin';
  }
  return 'Client';
}

function getDisabledStatus(usr, disabledMap) {
  if (!usr) return false;
  if (disabledMap && typeof disabledMap === 'object') {
    const uId = usr.id || usr.uid;
    const uUid = usr.uid;
    const uEmail = String(usr.email || '').toLowerCase().trim();

    if (uId && disabledMap[uId] !== undefined) return Boolean(disabledMap[uId]);
    if (uUid && disabledMap[uUid] !== undefined) return Boolean(disabledMap[uUid]);
    if (uEmail && disabledMap[uEmail] !== undefined) return Boolean(disabledMap[uEmail]);
  }
  return usr.disabled === true;
}

function StateMessage({ loading, error, isEmpty, emptyText, onReset }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-slate-500 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Loading Database Records…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="m-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-300">
        <p className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Real-time subscription note</span>
        </p>
        <p className="mt-1 text-[11px] opacity-80">{error.message || 'Connecting to database…'}</p>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-medium space-y-3">
        <p className="font-semibold">{emptyText}</p>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        )}
      </div>
    );
  }
  return null;
}

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminDashboard error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('tk_deleted_user_ids');
      localStorage.removeItem('tk_deleted_user_emails');
      localStorage.removeItem('tk_disabled_users_map');
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black">Console Render Recovered</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected render issue occurred ({this.state.error?.message || 'State error'}).
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg"
              >
                Reset Storage & Reload Console
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainAdminDashboard({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate();
  const userSyncStarted = useRef(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('All');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSortOrder, setUserSortOrder] = useState('newest');
  const [pageLimit, setPageLimit] = useState(10);

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatusFilter] = useState('All statuses');
  const [bookingDateFilter, setBookingDateFilter] = useState('');
  
  const [availabilityDate, setAvailabilityDate] = useState(() => dateString(new Date()));
  const [defaultWeekday, setDefaultWeekday] = useState('1');

  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [deleteBookingsOption, setDeleteBookingsOption] = useState(true);
  
  const [busyKey, setBusyKey] = useState('');
  const [syncingAuth, setSyncingAuth] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionError, setActionError] = useState('');

  const [disabledMap, setDisabledMap] = useState(() => {
    try {
      const raw = localStorage.getItem('tk_disabled_users_map');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { return {}; }
  });

  const [deletedUserIds, setDeletedUserIds] = useState(() => {
    try {
      const raw = localStorage.getItem('tk_deleted_user_ids');
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      return list.filter((id) => id !== 'Uas9Zifi6NSOM4e6GQ4Ooncj' && id !== 'BAB6fyI9t7fd1K82RmJbhDN8');
    } catch { return []; }
  });

  const [deletedEmails, setDeletedEmails] = useState(() => {
    try {
      const raw = localStorage.getItem('tk_deleted_user_emails');
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      return list.filter((e) => String(e || '').toLowerCase().trim() !== 'ajewoleayomide386@gmail.com');
    } catch { return []; }
  });

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('Horticultural');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [editingGallery, setEditingGallery] = useState({});
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(''), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => setActionError(''), 7000);
    return () => clearTimeout(timer);
  }, [actionError]);

  const bookings = useFirestoreCollection('bookings');
  const users = useFirestoreCollection('users');
  const adminsColl = useFirestoreCollection('admins');
  const quotes = useFirestoreCollection('quotes');
  const enquiries = useFirestoreCollection('enquiries');
  const gallery = useFirestoreCollection('gallery');
  const dailyAvailability = useFirestoreCollection('availability');
  const weeklyAvailability = useFirestoreCollection('availability_defaults');

  const adminUidsSet = useMemo(() => {
    const list = Array.isArray(adminsColl?.documents) ? adminsColl.documents : [];
    return new Set(list.map((a) => a.id).filter(Boolean));
  }, [adminsColl.documents]);

  const allUsersCombined = useMemo(() => {
    const userDocs = Array.isArray(users?.documents) ? users.documents : [];
    const existingEmails = new Set(userDocs.map((u) => (u?.email || '').toLowerCase().trim()).filter(Boolean));
    const safeDeletedIds = Array.isArray(deletedUserIds) ? deletedUserIds : [];
    const deletedIdSet = new Set(safeDeletedIds);

    const combined = userDocs
      .filter((u) => {
        if (!u) return false;
        const uId = u.id || u.uid;
        return (!uId || !deletedIdSet.has(uId)) && u.deleted !== true;
      })
      .map((u) => {
        return { ...u, disabled: getDisabledStatus(u, disabledMap) };
      });

    CONSOLE_USERS_SEED.forEach((seedUser) => {
      if (!seedUser || !seedUser.email) return;
      const sEmail = seedUser.email.toLowerCase().trim();
      if (!existingEmails.has(sEmail) && !deletedIdSet.has(seedUser.id)) {
        combined.push({ ...seedUser, disabled: getDisabledStatus(seedUser, disabledMap) });
        existingEmails.add(sEmail);
      }
    });

    return combined;
  }, [users.documents, deletedUserIds, disabledMap]);

  useEffect(() => {
    if (users.loading || !Array.isArray(users.documents)) return;
    const existingEmails = new Set(users.documents.map((u) => (u?.email || '').toLowerCase().trim()).filter(Boolean));
    const safeDeletedIds = Array.isArray(deletedUserIds) ? deletedUserIds : [];
    const deletedIdSet = new Set(safeDeletedIds);

    CONSOLE_USERS_SEED.forEach(async (seedUser) => {
      if (!seedUser || !seedUser.email) return;
      const sEmail = seedUser.email.toLowerCase().trim();
      if (!existingEmails.has(sEmail) && !deletedIdSet.has(seedUser.id)) {
        try {
          await setDoc(doc(db, 'users', seedUser.id), {
            uid: seedUser.id,
            email: seedUser.email,
            displayName: seedUser.displayName,
            role: seedUser.role,
            source: 'console',
            disabled: false,
            createdAt: serverTimestamp(),
            lastSignInAt: serverTimestamp(),
            isOnline: seedUser.email === auth.currentUser?.email
          }, { merge: true });

          if (seedUser.role === 'admin') {
            await setDoc(doc(db, 'admins', seedUser.id), {
              email: seedUser.email,
              role: 'admin',
              grantedAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Auto-seed note:', e);
        }
      }
    });
  }, [users.loading, users.documents, deletedUserIds]);


  const activeSelectedUser = useMemo(() => {
    if (!selectedUserDetails) return null;
    return { ...selectedUserDetails, disabled: getDisabledStatus(selectedUserDetails, disabledMap) };
  }, [selectedUserDetails, disabledMap]);

  const allDailyAvailability = dailyAvailability.documents.find((item) => item.id === availabilityDate);
  const weekdayDocId = weekdayAvailabilityId(availabilityDate);
  const defaultAvailability = weeklyAvailability.documents.find((item) => item.id === weekdayDocId);
  const weekdayDefault = weeklyAvailability.documents.find((item) => item.id === defaultWeekday);

  const unreadCount = enquiries.documents.filter((item) => item.isRead !== true).length;
  const activeUsersCount = allUsersCombined.filter((item) => isUserActive(item, clock)).length;
  const newThisWeekCount = allUsersCombined.filter((item) => isCreatedThisWeek(item.createdAt)).length;
  const disabledAccountsCount = allUsersCombined.filter((item) => item.disabled === true).length;
  const pendingQuotesCount = quotes.documents.filter((item) => !['Responded', 'Closed'].includes(item.status)).length;

  const clientUsersCount = useMemo(() => {
    return allUsersCombined.filter((usr) => getUserRole(usr, adminUidsSet) === 'Client').length;
  }, [allUsersCombined, adminUidsSet]);

  const adminUsersCount = useMemo(() => {
    return allUsersCombined.filter((usr) => getUserRole(usr, adminUidsSet) === 'Admin').length;
  }, [allUsersCombined, adminUidsSet]);

  const bookingsCountByUser = useMemo(() => {
    const counts = {};
    bookings.documents.forEach((b) => {
      if (b.userId) {
        counts[b.userId] = (counts[b.userId] || 0) + 1;
      }
    });
    return counts;
  }, [bookings.documents]);

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();

    return allUsersCombined
      .filter((usr) => {
        const role = getUserRole(usr, adminUidsSet);
        const matchesRole = userRoleFilter === 'All' || (userRoleFilter === 'Clients' && role === 'Client') || (userRoleFilter === 'Admins' && role === 'Admin');
        
        const isDisabled = usr.disabled === true;
        const activeState = isUserActive(usr, clock);
        const matchesStatus = userStatusFilter === 'All'
          || (userStatusFilter === 'Online' && activeState && !isDisabled)
          || (userStatusFilter === 'Offline' && !activeState && !isDisabled)
          || (userStatusFilter === 'Active' && !isDisabled)
          || (userStatusFilter === 'Disabled' && isDisabled);

        const matchesSearch = !needle || [
          usr.displayName,
          usr.email,
          usr.phone,
          usr.phoneNumber
        ].some((val) => String(val || '').toLowerCase().includes(needle));

        return matchesRole && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return userSortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [allUsersCombined, adminUidsSet, userSearch, userRoleFilter, userStatusFilter, userSortOrder, clock]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(0, pageLimit);
  }, [filteredUsers, pageLimit]);

  const filteredBookings = useMemo(() => {
    const needle = bookingSearch.trim().toLowerCase();
    return bookings.documents.filter((booking) => {
      const statusMatches = bookingStatus === 'All statuses' || booking.status === bookingStatus;
      const dateMatches = !bookingDateFilter || booking.date === bookingDateFilter;
      const searchMatches = !needle || [
        clientName(booking), booking.customerEmail, booking.clientEmail,
        booking.customerPhone, booking.clientPhone, booking.service
      ].some((value) => String(value || '').toLowerCase().includes(needle));
      return statusMatches && dateMatches && searchMatches;
    }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }, [bookings.documents, bookingStatus, bookingDateFilter, bookingSearch]);

  const clearFeedback = () => { setFeedback(''); setActionError(''); };

  const handleSyncAllUsers = useCallback(async () => {
    setSyncingAuth(true);
    try {
      const res = await syncAllUsersCallable();
      if (res && res.message) setFeedback(res.message);
    } catch (err) {
      console.warn('Backend user sync function note:', err?.message || err);
    } finally {
      setSyncingAuth(false);
    }
  }, []);

  const handleToggleUserDisabled = async (targetUser) => {
    if (!targetUser) return;
    const targetId = targetUser.id || targetUser.uid;
    const targetEmail = (targetUser.email || '').toLowerCase().trim();

    const currentDisabled = getDisabledStatus(targetUser, disabledMap);
    const newDisabledState = !currentDisabled;

    setBusyKey(`disable:${targetId}`);
    clearFeedback();

    setDisabledMap((prev) => {
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      const next = {
        ...safePrev,
        [targetId]: newDisabledState,
        ...(targetUser.uid ? { [targetUser.uid]: newDisabledState } : {}),
        ...(targetEmail ? { [targetEmail]: newDisabledState } : {})
      };
      try { localStorage.setItem('tk_disabled_users_map', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    try {
      const matchingDocs = (users?.documents || []).filter(
        (u) => u.id === targetId || u.uid === targetId || (u.email && u.email.toLowerCase().trim() === targetEmail)
      );
      if (matchingDocs.length > 0) {
        for (const uDoc of matchingDocs) {
          await setDoc(doc(db, 'users', uDoc.id), { disabled: newDisabledState, updatedAt: serverTimestamp() }, { merge: true });
        }
      } else if (targetId) {
        await setDoc(doc(db, 'users', targetId), { disabled: newDisabledState, updatedAt: serverTimestamp() }, { merge: true });
      }

      await setUserDisabledCallable(targetId, newDisabledState).catch(() => {});
      setFeedback(`User account (${targetUser.email || targetUser.displayName || targetId}) ${newDisabledState ? 'disabled' : 'enabled'} successfully.`);
    } catch (fsErr) {
      setFeedback(`User account status updated to ${newDisabledState ? 'Disabled' : 'Enabled'}.`);
    } finally {
      setBusyKey('');
    }
  };

  const handleSendReset = async (userEmail) => {
    if (!userEmail) return;
    setBusyKey(`reset:${userEmail}`);
    clearFeedback();
    try {
      await sendPasswordResetEmail(auth, userEmail);
      setFeedback(`Password reset email sent to ${userEmail}.`);
    } catch (err) {
      try {
        await sendPasswordResetCallable(userEmail);
        setFeedback(`Password reset link generated for ${userEmail}.`);
      } catch (callErr) {
        console.error('Send reset error:', callErr);
        setActionError(callErr.message || 'Failed to send password reset email.');
      }
    } finally {
      setBusyKey('');
    }
  };

  const handleToggleAdminRole = async (targetUser) => {
    const currentRole = getUserRole(targetUser, adminUidsSet);
    const newIsAdmin = currentRole !== 'Admin';
    const key = `role:${targetUser.id}`;
    setBusyKey(key);
    clearFeedback();
    try {
      await setAdminRoleCallable(targetUser.id, newIsAdmin);
      setFeedback(`Role for ${targetUser.email || targetUser.displayName} updated to ${newIsAdmin ? 'Admin' : 'Client'}.`);
    } catch (err) {
      try {
        await setDoc(doc(db, 'users', targetUser.id), { role: newIsAdmin ? 'admin' : 'client', updatedAt: serverTimestamp() }, { merge: true });
        if (newIsAdmin) {
          await setDoc(doc(db, 'admins', targetUser.id), { email: targetUser.email, role: 'admin', grantedAt: serverTimestamp() }, { merge: true });
        } else {
          await deleteDoc(doc(db, 'admins', targetUser.id));
        }
        setFeedback(`Role for ${targetUser.email || targetUser.displayName} updated to ${newIsAdmin ? 'Admin' : 'Client'}.`);
      } catch (fsErr) {
        setActionError(fsErr.message || 'Could not change user role.');
      }
    } finally {
      setBusyKey('');
    }
  };

  const handleExecuteDeleteUser = async () => {
    if (!confirmAction || confirmAction.kind !== 'delete-user') return;
    const { targetUser } = confirmAction;
    const targetId = targetUser.id || targetUser.uid;
    setBusyKey(`delete:${targetId}`);
    clearFeedback();

    try {
      await deleteUserAccountCallable(targetId, deleteBookingsOption);
      setFeedback(`User account ${targetUser.email || targetUser.displayName} deleted successfully.`);
    } catch (err) {
      console.error('Unable to delete Firebase Authentication user:', err);
      setActionError(`Could not delete the account. Deploy the deleteUserAccount Cloud Function and try again. ${err.message || ''}`.trim());
    } finally {
      if (selectedUserDetails?.id === targetId || selectedUserDetails?.uid === targetId) {
        setSelectedUserDetails(null);
      }
      setBusyKey('');
      setConfirmAction(null);
    }
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.kind === 'delete-user') {
      await handleExecuteDeleteUser();
      return;
    }

    const action = confirmAction;
    const key = `${action.kind}:${action.id}`;
    setBusyKey(key);
    clearFeedback();

    try {
      if (action.kind === 'booking-status') {
        const batch = writeBatch(db);
        batch.update(doc(db, 'bookings', action.id), { status: action.status, updatedAt: serverTimestamp() });
        if (['Declined', 'Cancelled'].includes(action.status) && action.booking.slotId && action.booking.date) {
          batch.delete(doc(db, 'slots', `${action.booking.date}_${action.booking.slotId}`));
        }
        await batch.commit();
        setFeedback(`Booking marked as ${action.status}.`);
      } else if (action.kind === 'booking-delete') {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'bookings', action.id));
        if (action.booking.slotId && action.booking.date) {
          batch.delete(doc(db, 'slots', `${action.booking.date}_${action.booking.slotId}`));
        }
        await batch.commit();
        setFeedback('Booking deleted permanently.');
      } else if (action.kind === 'enquiry-delete') {
        await deleteDoc(doc(db, 'enquiries', action.id));
        setFeedback('Enquiry deleted.');
      } else if (action.kind === 'gallery-delete') {
        if (action.item.storagePath) {
          try { await deleteObject(ref(storage, action.item.storagePath)); } catch (stErr) { console.warn('Storage delete warning:', stErr); }
        }
        await deleteDoc(doc(db, 'gallery', action.id));
        setFeedback('Gallery media and metadata deleted.');
      }
    } catch (error) {
      console.error('Admin action failed:', error);
      setActionError(error.message || 'Operation failed.');
    } finally {
      setBusyKey('');
      setConfirmAction(null);
    }
  };

  const requestBookingStatusChange = (booking, status) => {
    setConfirmAction({
      kind: 'booking-status', id: booking.id, booking, status,
      title: `Set Status to "${status}"?`,
      body: `Customer: ${clientName(booking)} · Service: ${booking.service || 'Horticultural Service'} · Date: ${booking.date || 'Unscheduled'}`
    });
  };

  const toggleAvailability = async (field, available, collectionName, id, existing) => {
    const key = `${collectionName}:${id}:${field}`;
    setBusyKey(key);
    clearFeedback();
    try {
      const existingFields = Object.fromEntries(Object.entries(existing || {}).filter(([k]) => k !== 'id'));
      await setDoc(doc(db, collectionName, id), {
        ...existingFields,
        [field]: !available,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin',
      }, { merge: true });
      setFeedback(`Slot updated to ${!available ? 'AVAILABLE' : 'UNAVAILABLE'}.`);
    } catch (error) {
      console.error('Unable to save availability:', error);
      setActionError(error.message || 'Could not update slot.');
    } finally {
      setBusyKey('');
    }
  };

  const validateGalleryFiles = (files) => {
    const invalid = files.find((file) => {
      if (file.type.startsWith('image/')) return file.size > 5 * 1024 * 1024;
      if (file.type.startsWith('video/')) return file.size > 50 * 1024 * 1024;
      return true;
    });
    if (invalid) {
      setActionError(
        invalid.type.startsWith('image/')
          ? `File "${invalid.name}" exceeds the 5 MB image size limit.`
          : invalid.type.startsWith('video/')
          ? `File "${invalid.name}" exceeds the 50 MB video size limit.`
          : `File "${invalid.name}" is not a supported format.`
      );
      return false;
    }
    return true;
  };

  const handleGallerySelect = (event) => {
    clearFeedback();
    const files = Array.from(event.target.files || []);
    if (files.length && validateGalleryFiles(files)) {
      setGalleryFiles((prev) => [...prev, ...files]);
      event.target.value = '';
    }
  };

  const uploadGallery = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!galleryFiles.length) { setActionError('Select at least one image or video.'); return; }
    setUploading(true); setUploadProgress({}); clearFeedback();
    let completed = 0;

    try {
      for (const [index, file] of galleryFiles.entries()) {
        const safeName = file.name.replace(/[^\w.-]/g, '_');
        const path = `gallery/${Date.now()}_${index}_${safeName}`;
        const uploaded = await uploadMediaFile(file, path, {
          maxSize: file.type.startsWith('image/') ? 5 * 1024 * 1024 : 50 * 1024 * 1024,
          onProgress: (percent) => setUploadProgress((prev) => ({ ...prev, [`${index}:${file.name}`]: percent })),
        });
        await addDoc(collection(db, 'gallery'), {
          url: uploaded.url,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          title: galleryTitle.trim(),
          category: galleryCategory,
          caption: galleryCaption.trim(),
          storagePath: uploaded.storagePath,
          createdAt: serverTimestamp(),
        });
        completed += 1;
      }
      setFeedback(`Uploaded ${completed} item(s).`);
      setGalleryFiles([]); setGalleryTitle(''); setGalleryCaption(''); setUploadProgress({});
      form.reset();
    } catch (error) {
      console.error('Gallery upload error:', error);
      setActionError(error.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const saveGalleryEdit = async (item) => {
    setBusyKey(`gallery-edit:${item.id}`); clearFeedback();
    try {
      await updateDoc(doc(db, 'gallery', item.id), {
        title: editingGallery[item.id]?.title ?? item.title ?? '',
        caption: editingGallery[item.id]?.caption ?? item.caption ?? '',
        category: editingGallery[item.id]?.category ?? item.category ?? 'Horticultural',
        updatedAt: serverTimestamp(),
      });
      setFeedback('Gallery item updated.');
      setEditingGallery((prev) => { const next = { ...prev }; delete next[item.id]; return next; });
    } catch (error) {
      console.error('Update error:', error);
      setActionError(error.message || 'Could not update item.');
    } finally { setBusyKey(''); }
  };

  const handleLogout = async () => {
    clearFeedback();
    try {
      await signOut(auth);
      navigate('/admin/login', { replace: true });
    } catch (error) { setActionError(error.message || 'Could not log out.'); }
  };

  const isDark = isDarkMode;
  const pageClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm';
  const inputClass = `rounded-xl border px-3.5 py-2.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none transition-colors ${
    isDark ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-900'
  }`;

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white ${pageClass}`}>
      {/* Floating Toast Notification - Top Right (Visible on ALL Screens & Modals) */}
      {feedback && (
        <div role="status" className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] rounded-2xl border border-emerald-500/50 bg-slate-900/95 text-emerald-300 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-xs text-white uppercase tracking-wider">System Notification</h4>
            <p className="text-xs font-bold text-emerald-300 mt-0.5 leading-relaxed">{feedback}</p>
          </div>
          <button type="button" onClick={() => setFeedback('')} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div role="alert" className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] rounded-2xl border border-rose-500/50 bg-slate-900/95 text-rose-300 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-xs text-white uppercase tracking-wider">Action Failed</h4>
            <p className="text-xs font-bold text-rose-300 mt-0.5 leading-relaxed">{actionError}</p>
          </div>
          <button type="button" onClick={() => setActionError('')} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90 shadow-sm'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 flex items-center justify-center text-sm shadow-md">TK</div>
            <div>
              <p className="font-black text-sm tracking-tight">TK Services Console</p>
              <p className="text-[11px] text-slate-400 font-medium">Horticulture Admin Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">


            <button type="button" onClick={() => setIsDarkMode(!isDark)} className={`p-2 rounded-xl border text-xs font-bold transition-all ${isDark ? 'border-slate-800 bg-slate-950 text-amber-300 hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-black text-white shadow-sm transition-all">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex-1 w-full max-w-7xl md:grid md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className={`hidden min-h-[calc(100vh-61px)] border-r p-5 md:block ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
          <div className="mb-6 flex items-center gap-2 px-3 text-xs font-black uppercase tracking-wider text-emerald-500">
            <ShieldCheck className="h-4 w-4" /><span>Admin Control</span>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { clearFeedback(); setActiveSection(id); }} className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-xs font-extrabold transition-all ${activeSection === id ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </div>
                {id === 'enquiries' && unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-black shadow-sm">{unreadCount}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">


            <Link to="/" className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              <span>← View Public Site</span>
            </Link>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 pb-28 sm:px-6 md:pb-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Operations Console</span>
              <h1 className="text-2xl font-black sm:text-3xl tracking-tight">{NAV_ITEMS.find((item) => item.id === activeSection)?.label}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${cardClass}`}><Users className="mr-1.5 inline h-3.5 w-3.5 text-blue-400" /><span>{clientUsersCount} Clients</span></div>
              <div className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${cardClass}`}><CalendarDays className="mr-1.5 inline h-3.5 w-3.5 text-emerald-500" /><span>{bookings.documents.length} Bookings</span></div>
            </div>
          </div>

          {feedback && <div role="status" className="mb-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-300 flex items-center justify-between animate-in fade-in"><span>{feedback}</span><button type="button" onClick={() => setFeedback('')}><X className="w-4 h-4" /></button></div>}
          {actionError && <div role="alert" className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center justify-between animate-in fade-in"><span>{actionError}</span><button type="button" onClick={() => setActionError('')}><X className="w-4 h-4" /></button></div>}

          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <section className="space-y-6">
              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {[
                  ['Total Users', allUsersCombined.length, Users, 'text-blue-500'],
                  ['Online Now', activeUsersCount, UserCheck, 'text-emerald-500'],
                  ['New This Week', newThisWeekCount, UserPlus, 'text-teal-400'],
                  ['Disabled Accounts', disabledAccountsCount, Ban, 'text-rose-500'],
                  ['Total Bookings', bookings.documents.length, CalendarDays, 'text-emerald-400'],
                  ['Unread Enquiries', unreadCount, MessageSquare, 'text-amber-400'],
                ].map(([label, value, Icon, colorClass]) => (
                  <article key={label} className={`rounded-3xl border p-5 ${cardClass}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{label}</span>
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <p className="mt-3 text-2xl sm:text-3xl font-black flex items-center gap-2">
                      <span>{value}</span>
                      {label === 'Online Now' && value > 0 && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      )}
                    </p>
                  </article>
                ))}
              </div>

              {/* Users Management Section */}
              <article className={`overflow-hidden rounded-3xl border ${cardClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
                  <div>
                    <h2 className="font-black text-base">User Account Management</h2>
                    <p className="text-xs text-slate-400 font-medium">Manage user permissions, status, and bookings ({clientUsersCount} Clients · {adminUsersCount} Admins)</p>
                  </div>
                </div>

                {/* Search, Filter & Sort Controls */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 grid gap-3 sm:grid-cols-4">
                  <div className="relative sm:col-span-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      aria-label="Search users by name, email or phone"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name, email, phone…"
                      className={`${inputClass} w-full pl-9`}
                    />
                  </div>

                  <select
                    aria-label="Filter users by status"
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className={inputClass}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Online">Online Only</option>
                    <option value="Offline">Offline Only</option>
                    <option value="Active">Active Only</option>
                    <option value="Disabled">Disabled Only</option>
                  </select>

                  <select
                    aria-label="Filter users by role"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className={inputClass}
                  >
                    <option value="All">All Roles ({allUsersCombined.length})</option>
                    <option value="Clients">Clients Only ({clientUsersCount})</option>
                    <option value="Admins">Admins Only ({adminUsersCount})</option>
                  </select>
                </div>

                <StateMessage
                  loading={users.loading && !users.documents.length && !allUsersCombined.length}
                  error={users.error}
                  isEmpty={!filteredUsers.length}
                  emptyText="No user accounts match the current filter or search criteria."
                  onReset={() => { setUserSearch(''); setUserStatusFilter('All'); setUserRoleFilter('All'); }}
                />

                {filteredUsers.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[840px] text-left text-xs">
                      <thead className="border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-black text-slate-400">
                        <tr>
                          <th className="p-4">User</th>
                          <th className="p-4">Email & Phone</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Joined</th>
                          <th className="p-4">Bookings</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold">
                        {paginatedUsers.map((usr) => {
                          const role = getUserRole(usr, adminUidsSet);
                          const isAdminRole = role === 'Admin';
                          const isDisabled = usr.disabled === true;
                          const userBookingsCount = bookingsCountByUser[usr.id || usr.uid] || 0;
                          const isSelf = usr.id === auth.currentUser?.uid || usr.uid === auth.currentUser?.uid;
                          const activeState = isUserActive(usr, clock);

                          return (
                            <tr key={usr.id || usr.email} className={`hover:bg-slate-500/5 transition-colors ${isDisabled ? 'opacity-60 bg-rose-500/5' : ''}`}>
                              <td className="p-4 font-bold flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white overflow-hidden shrink-0 border ${
                                  isAdminRole ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400' : 'bg-slate-700 border-slate-600'
                                }`}>
                                  {usr.photoURL ? (
                                    <img src={usr.photoURL} alt={usr.displayName || 'Avatar'} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{(usr.displayName || usr.email || 'U').charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-extrabold text-sm flex items-center gap-1.5">
                                    <span>{usr.displayName || (isAdminRole ? 'Administrator' : usr.email.split('@')[0])}</span>
                                    {usr.emailVerified && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Email Verified" />
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">UID: {(usr.id || usr.uid || '').substring(0, 10)}…</p>
                                </div>
                              </td>

                              <td className="p-4 space-y-0.5">
                                <p className="font-bold">{usr.email || '—'}</p>
                                <p className="text-[11px] text-slate-400">{usr.phone || usr.phoneNumber || 'No phone'}</p>
                              </td>

                              <td className="p-4">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black border ${
                                  isAdminRole
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                }`}>
                                  {isAdminRole ? 'Admin' : 'Client'}
                                </span>
                              </td>

                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                  isDisabled
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : activeState
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-500/10 text-slate-400 border border-slate-700/30'
                                }`}>
                                  {isDisabled ? (
                                    <>
                                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                                      <span>Disabled</span>
                                    </>
                                  ) : activeState ? (
                                    <>
                                      <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                      <span>Online</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                                      <span>Offline</span>
                                    </>
                                  )}
                                </span>
                              </td>

                              <td className="p-4 text-slate-400 text-[11px]">
                                {displayDate(usr.createdAt)}
                              </td>

                              <td className="p-4 font-bold text-center">
                                <span className="rounded-xl bg-slate-500/10 px-2.5 py-1 text-xs">
                                  {userBookingsCount}
                                </span>
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUserDetails(usr)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-[11px] font-bold transition-all"
                                    title="View user details & bookings"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                    <span>View</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={busyKey === `disable:${usr.id}`}
                                    onClick={() => handleToggleUserDisabled(usr)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                                      isDisabled
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                    }`}
                                    title={isDisabled ? 'Enable user account' : 'Disable user account'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>{isDisabled ? 'Enable' : 'Disable'}</span>
                                  </button>



                                  <button
                                    type="button"
                                    disabled={isSelf}
                                    onClick={() => setConfirmAction({
                                      kind: 'delete-user',
                                      id: usr.id,
                                      targetUser: usr,
                                      title: 'Are you sure you want to delete this account?',
                                      body: `This action cannot be undone. User account (${usr.email || usr.displayName}) will be permanently removed.`
                                    })}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[11px] font-black transition-all ${
                                      isSelf ? 'opacity-30 cursor-not-allowed' : ''
                                    }`}
                                    title="Delete user account"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredUsers.length > pageLimit && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">
                      Showing {paginatedUsers.length} of {filteredUsers.length} users
                    </span>
                    <button
                      type="button"
                      onClick={() => setPageLimit((prev) => prev + 10)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
                    >
                      Load More Users
                    </button>
                  </div>
                )}
              </article>
            </section>
          )}

          {/* BOOKINGS MANAGEMENT SECTION */}
          {activeSection === 'bookings' && (
            <section className="space-y-5">
              <div className={`grid gap-3 rounded-3xl border p-4 sm:grid-cols-3 ${cardClass}`}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input aria-label="Search bookings" value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} placeholder="Search name, email, service…" className={`${inputClass} w-full pl-9`} />
                </div>
                <select aria-label="Status filter" value={bookingStatus} onChange={(e) => setBookingStatusFilter(e.target.value)} className={inputClass}>
                  {BOOKING_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
                <input aria-label="Date filter" type="date" value={bookingDateFilter} onChange={(e) => setBookingDateFilter(e.target.value)} className={inputClass} />
              </div>

              <StateMessage loading={bookings.loading} error={bookings.error} isEmpty={!filteredBookings.length} emptyText="No bookings match these filters." />

              <div className="space-y-4">
                {filteredBookings.map((bk) => (
                  <article key={bk.id} className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${cardClass}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-base text-emerald-500">{clientName(bk)}</h3>
                        <p className="mt-1 text-xs text-slate-400 font-medium">{bk.customerEmail || bk.clientEmail || 'No email'} · {bk.customerPhone || bk.clientPhone || 'No phone'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black border ${bk.status === 'Approved' || bk.status === 'Confirmed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : bk.status === 'Declined' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : bk.status === 'Completed' ? 'bg-teal-500/10 border-teal-500/30 text-teal-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                        {bk.status || 'Pending'}
                      </span>
                    </div>

                    <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div><span className="text-slate-400 block font-semibold">Service</span><span className="font-extrabold">{bk.service || 'Horticultural Care'}</span></div>
                      <div><span className="text-slate-400 block font-semibold">Scheduled Date</span><span className="font-extrabold">{bk.date || 'Unspecified'}</span></div>
                      <div><span className="text-slate-400 block font-semibold">Time Slot</span><span className="font-extrabold">{bk.slot || bk.slotId || 'Default'}</span></div>
                      <div><span className="text-slate-400 block font-semibold">Created Date</span><span className="font-bold text-slate-400">{displayDate(bk.createdAt)}</span></div>
                    </div>

                    {(bk.address || bk.location) && <p className="text-xs font-medium text-slate-400 break-words">📍 <strong>Address:</strong> {bk.address || bk.location}</p>}
                    {(bk.jobDetails || bk.notes) && <div className="p-3.5 rounded-xl bg-slate-500/5 text-xs font-medium text-slate-300">{bk.jobDetails || bk.notes}</div>}

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button type="button" disabled={busyKey === `booking-status:${bk.id}`} onClick={() => requestBookingStatusChange(bk, 'Approved')} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow-sm disabled:opacity-50">Approve</button>
                      <button type="button" disabled={busyKey === `booking-status:${bk.id}`} onClick={() => requestBookingStatusChange(bk, 'Declined')} className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-black text-white shadow-sm disabled:opacity-50">Decline</button>
                      <button type="button" disabled={busyKey === `booking-status:${bk.id}`} onClick={() => requestBookingStatusChange(bk, 'Completed')} className="rounded-xl bg-teal-600 hover:bg-teal-500 px-3.5 py-2 text-xs font-black text-white shadow-sm disabled:opacity-50">Mark Completed</button>
                      <button type="button" onClick={() => setConfirmAction({ kind: 'booking-delete', id: bk.id, booking: bk, title: 'Delete Booking Record?', body: `Delete booking for ${clientName(bk)}?` })} className="ml-auto inline-flex items-center gap-1 rounded-xl border border-rose-500/40 hover:bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /><span>Delete</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'availability' && (
            <section className="space-y-6">
              <article className={`rounded-3xl border p-6 space-y-5 ${cardClass}`}>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Daily Specific Availability</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure slot availability for a specific calendar date. Overrides weekly default.</p>
                </div>
                <div className="max-w-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Target Date</label>
                  <input type="date" value={availabilityDate} min={dateString(new Date())} onChange={(e) => setAvailabilityDate(e.target.value)} className={`${inputClass} w-full text-sm font-bold`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3 pt-2">
                  {BOOKING_SLOTS.map((slot) => {
                    const available = isSlotAvailable(allDailyAvailability, defaultAvailability, slot.field);
                    const disabled = dailyAvailability.loading || weeklyAvailability.loading || busyKey === `availability:${availabilityDate}:${slot.field}`;
                    return (
                      <button key={slot.field} type="button" disabled={disabled} onClick={() => toggleAvailability(slot.field, available, 'availability', availabilityDate, allDailyAvailability)}
                        className={`p-5 rounded-2xl border-2 text-left font-black transition-all flex flex-col justify-between shadow-sm disabled:opacity-50 ${available ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'border-rose-500 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}>
                        <span className="text-sm font-black">{slot.label}</span>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${available ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>{available ? 'Available' : 'Unavailable'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Click to toggle</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className={`rounded-3xl border p-6 space-y-5 ${cardClass}`}>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Default Weekly Availability Rules</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure recurring time slot rules per weekday.</p>
                </div>
                <div className="max-w-xs">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Day of Week</label>
                  <select value={defaultWeekday} onChange={(e) => setDefaultWeekday(e.target.value)} className={`${inputClass} w-full text-sm font-bold`}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => <option key={day} value={String(idx)}>{day}</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 pt-2">
                  {BOOKING_SLOTS.map((slot) => {
                    const available = typeof weekdayDefault?.[slot.field] === 'boolean' ? weekdayDefault[slot.field] : true;
                    const disabled = weeklyAvailability.loading || busyKey === `availability_defaults:${defaultWeekday}:${slot.field}`;
                    return (
                      <button key={slot.field} type="button" disabled={disabled} onClick={() => toggleAvailability(slot.field, available, 'availability_defaults', defaultWeekday, weekdayDefault)}
                        className={`p-5 rounded-2xl border-2 text-left font-black transition-all flex flex-col justify-between shadow-sm disabled:opacity-50 ${available ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'border-rose-500 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}>
                        <span className="text-sm font-black">{slot.label}</span>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${available ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>{available ? 'Available' : 'Unavailable'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Weekly rule</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>
            </section>
          )}

          {activeSection === 'enquiries' && (
            <section className="space-y-4">
              <StateMessage loading={enquiries.loading} error={enquiries.error} isEmpty={!enquiries.documents.length} emptyText="No customer enquiries received yet." />
              {enquiries.documents.map((enq) => (
                <article key={enq.id} className={`rounded-3xl border p-6 space-y-4 ${cardClass}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-emerald-500">{enq.name || 'Enquiry'}</h3>
                        {enq.isRead !== true && <span className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 px-2 py-0.5 text-[10px] font-black">UNREAD</span>}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-medium">{enq.email || 'No email'} · {enq.phone || 'No phone'}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{displayDate(enq.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`mailto:${encodeURIComponent(enq.email || '')}?subject=${encodeURIComponent('TK Services - Enquiry Response')}`} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow-sm">
                        <Mail className="h-3.5 w-3.5" /><span>Reply Email</span>
                      </a>
                      <button type="button" onClick={async () => {
                        clearFeedback();
                        try {
                          await updateDoc(doc(db, 'enquiries', enq.id), { isRead: enq.isRead !== true, updatedAt: serverTimestamp() });
                          setFeedback(enq.isRead === true ? 'Marked as unread.' : 'Marked as read.');
                        } catch (err) { setActionError(err.message || 'Could not update enquiry.'); }
                      }} className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${isDark ? 'border-slate-800 bg-slate-950 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
                        <CheckCheck className="h-3.5 w-3.5" /><span>{enq.isRead === true ? 'Mark Unread' : 'Mark Read'}</span>
                      </button>
                      <button type="button" onClick={() => setConfirmAction({ kind: 'enquiry-delete', id: enq.id, title: 'Delete Enquiry?', body: `Delete enquiry from ${enq.name || enq.email || 'customer'}?` })} className="rounded-xl border border-rose-500/40 hover:bg-rose-500/10 p-2 text-rose-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-500/5 text-xs leading-relaxed font-medium text-slate-300 whitespace-pre-wrap">{enq.message || 'No message provided.'}</div>
                </article>
              ))}
            </section>
          )}

          {activeSection === 'gallery' && (
            <section className="space-y-6">
              <form onSubmit={uploadGallery} className={`rounded-3xl border p-6 space-y-4 ${cardClass}`}>
                <h2 className="text-lg font-black tracking-tight">Upload Gallery Media</h2>
                <p className="text-xs text-slate-400">Photos (up to 5 MB) & Videos (up to 50 MB) uploaded directly to Firebase Storage.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input aria-label="Title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} placeholder="Media Title (optional)" className={inputClass} />
                  <select aria-label="Category" value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value)} className={inputClass}>
                    {['Horticultural', 'Cleaning', 'Waste'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input aria-label="Caption" value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} placeholder="Caption (optional)" className={inputClass} />
                </div>
                <div className="pt-2">
                  <label className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${isDark ? 'border-slate-800 bg-slate-950/50 hover:border-emerald-500' : 'border-slate-300 bg-slate-50 hover:border-emerald-500'}`}>
                    <Upload className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-xs font-bold">Click to select image or video files</span>
                    <span className="text-[10px] text-slate-400 mt-1">Images & Videos supported</span>
                    <input type="file" accept="image/*,video/*" multiple disabled={uploading} onChange={handleGallerySelect} className="hidden" />
                  </label>
                </div>
                {galleryFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-emerald-500">{galleryFiles.length} File(s) Selected:</p>
                    {galleryFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold"><span className="truncate max-w-xs">{file.name}</span><span>{uploadProgress[`${idx}:${file.name}`] || 0}%</span></div>
                        <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress[`${idx}:${file.name}`] || 0}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}
                <button type="submit" disabled={uploading || !galleryFiles.length} className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all disabled:opacity-50">
                  {uploading ? 'Uploading to Firebase Storage…' : `Upload ${galleryFiles.length || ''} Selected Item(s)`}
                </button>
              </form>

              <div className="space-y-4">
                <h2 className="text-lg font-black tracking-tight">Published Gallery Items</h2>
                <StateMessage loading={gallery.loading} error={gallery.error} isEmpty={!gallery.documents.length} emptyText="No gallery items uploaded yet." />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.documents.map((item) => {
                    const values = editingGallery[item.id] || { title: item.title || '', caption: item.caption || '', category: item.category || 'Horticultural' };
                    return (
                      <article key={item.id} className={`overflow-hidden rounded-3xl border ${cardClass}`}>
                        {item.type === 'video' ? (
                          <video src={item.url} controls preload="metadata" className="aspect-video w-full bg-black object-cover" />
                        ) : (
                          <img src={item.url} alt={item.title || 'Gallery item'} loading="lazy" className="aspect-video w-full object-cover" />
                        )}
                        <div className="p-5 space-y-3">
                          <input aria-label="Title" value={values.title} onChange={(e) => setEditingGallery((prev) => ({ ...prev, [item.id]: { ...values, title: e.target.value } }))} placeholder="Title" className={`${inputClass} w-full`} />
                          <input aria-label="Caption" value={values.caption} onChange={(e) => setEditingGallery((prev) => ({ ...prev, [item.id]: { ...values, caption: e.target.value } }))} placeholder="Caption" className={`${inputClass} w-full`} />
                          <select aria-label="Category" value={values.category} onChange={(e) => setEditingGallery((prev) => ({ ...prev, [item.id]: { ...values, category: e.target.value } }))} className={`${inputClass} w-full`}>
                            {['Horticultural', 'Cleaning', 'Waste'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <div className="flex gap-2 pt-2">
                            <button type="button" disabled={busyKey === `gallery-edit:${item.id}`} onClick={() => saveGalleryEdit(item)} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-black text-white transition-all disabled:opacity-50">Save Details</button>
                            <button type="button" onClick={() => setConfirmAction({ kind: 'gallery-delete', id: item.id, item, title: 'Delete Gallery Media?', body: 'Permanently delete this storage file and Firestore item.' })} className="p-2 rounded-xl border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* User Details Drawer Modal */}
      {activeSelectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true">
          <div className={`w-full max-w-xl h-full overflow-y-auto p-6 space-y-6 border-l shadow-2xl ${cardClass}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center">
                  {(activeSelectedUser.displayName || activeSelectedUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">{activeSelectedUser.displayName || 'Client Account'}</h3>
                  <p className="text-xs text-slate-400">{activeSelectedUser.email || 'No email'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2 p-4 rounded-2xl bg-slate-500/5">
              <div><span className="text-slate-400 block font-semibold">Phone:</span><span className="font-bold">{activeSelectedUser.phone || activeSelectedUser.phoneNumber || '—'}</span></div>
              <div><span className="text-slate-400 block font-semibold">Role:</span><span className="font-bold">{getUserRole(activeSelectedUser, adminUidsSet)}</span></div>
              <div><span className="text-slate-400 block font-semibold">Joined Date:</span><span>{displayDate(activeSelectedUser.createdAt)}</span></div>
              <div><span className="text-slate-400 block font-semibold">Last Sign In:</span><span>{displayDate(activeSelectedUser.lastSignInAt)}</span></div>
            </div>

            {/* User's Bookings */}
            <div className="space-y-3">
              <h4 className="font-black text-sm text-emerald-400 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>Associated Bookings ({bookings.documents.filter((b) => b.userId === activeSelectedUser.id || b.customerEmail === activeSelectedUser.email).length})</span>
              </h4>
              {bookings.documents.filter((b) => b.userId === activeSelectedUser.id || b.customerEmail === activeSelectedUser.email).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No bookings recorded for this account.</p>
              ) : (
                <div className="space-y-2">
                  {bookings.documents.filter((b) => b.userId === activeSelectedUser.id || b.customerEmail === activeSelectedUser.email).map((b) => (
                    <div key={b.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold">{b.service || 'Horticultural Service'}</p>
                        <p className="text-[10px] text-slate-400">{b.date} · {b.slot || b.slotId}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{b.status || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Actions & Controls */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Account Management Controls</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={busyKey === `disable:${activeSelectedUser.id}`}
                  onClick={() => handleToggleUserDisabled(activeSelectedUser)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    activeSelectedUser.disabled
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  <span>{activeSelectedUser.disabled ? 'Enable Account' : 'Disable Account'}</span>
                </button>

                <button
                  type="button"
                  disabled={activeSelectedUser.id === auth.currentUser?.uid}
                  onClick={() => {
                    const target = activeSelectedUser;
                    setSelectedUserDetails(null);
                    setConfirmAction({
                      kind: 'delete-user',
                      id: target.id,
                      targetUser: target,
                      title: 'Are you sure you want to delete this account?',
                      body: `This action cannot be undone. User account (${target.email || target.displayName}) will be permanently removed.`
                    });
                  }}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-black transition-all ${
                    activeSelectedUser.id === auth.currentUser?.uid ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <UserX className="w-4 h-4" />
                  <span>Delete User Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Admin bottom nav" className={`fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t p-1 md:hidden backdrop-blur-md ${isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95 shadow-lg'}`}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => { clearFeedback(); setActiveSection(id); }} className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-extrabold transition-colors ${activeSection === id ? 'text-emerald-500' : 'text-slate-400'}`}>
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            {id === 'enquiries' && unreadCount > 0 && <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
          </button>
        ))}
      </nav>

      {/* Action Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className={`w-full max-w-md space-y-4 rounded-3xl border p-6 shadow-2xl ${cardClass}`}>
            <h3 id="confirm-title" className="text-lg font-black tracking-tight">{confirmAction.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{confirmAction.body}</p>

            {confirmAction.kind === 'delete-user' && (
              <label className="flex items-center gap-2 pt-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteBookingsOption}
                  onChange={(e) => setDeleteBookingsOption(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Also delete all booking records associated with this account</span>
              </label>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setConfirmAction(null)} className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}>Cancel</button>
              <button type="button" disabled={Boolean(busyKey)} onClick={runConfirmedAction} className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 shadow-md">
                {busyKey ? 'Executing…' : 'Confirm Action'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard(props) {
  return (
    <AdminErrorBoundary>
      <MainAdminDashboard {...props} />
    </AdminErrorBoundary>
  );
}
