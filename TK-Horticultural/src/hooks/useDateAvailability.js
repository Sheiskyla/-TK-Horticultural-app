import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const BOOKING_SLOTS = [
  { id: 'slot1', field: 'slot1', label: '9:00–11:00 AM' },
  { id: 'slot2', field: 'slot2', label: '12:00–2:00 PM' },
  { id: 'slot3', field: 'slot3', label: '2:00–4:00 PM' },
];

export function weekdayAvailabilityId(date) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return String(weekday);
}

export function isSlotAvailable(dateSettings, weeklySettings, field) {
  if (typeof dateSettings?.[field] === 'boolean') return dateSettings[field];
  if (typeof weeklySettings?.[field] === 'boolean') return weeklySettings[field];
  return true;
}

export default function useDateAvailability(date) {
  const [state, setState] = useState({
    date: null,
    dateSettings: null,
    weeklySettings: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!date) return undefined;
    let dateSettings = null;
    let weeklySettings = null;
    let received = 0;
    let active = true;
    const publish = () => {
      received += 1;
      if (active) {
        setState({
          date,
          dateSettings,
          weeklySettings,
          loading: received < 2,
          error: null,
        });
      }
    };
    const onError = (error) => {
      console.error(`Unable to load availability for ${date}:`, error);
      if (active) setState({ date, dateSettings, weeklySettings, loading: false, error });
    };

    const unsubscribeDate = onSnapshot(
      doc(db, 'availability', date),
      (snapshot) => {
        dateSettings = snapshot.exists() ? snapshot.data() : null;
        publish();
      },
      onError
    );
    const unsubscribeWeekly = onSnapshot(
      doc(db, 'availability_defaults', weekdayAvailabilityId(date)),
      (snapshot) => {
        weeklySettings = snapshot.exists() ? snapshot.data() : null;
        publish();
      },
      onError
    );

    return () => {
      active = false;
      unsubscribeDate();
      unsubscribeWeekly();
    };
  }, [date]);

  const isCurrentDate = state.date === date;
  return {
    dateSettings: isCurrentDate ? state.dateSettings : null,
    weeklySettings: isCurrentDate ? state.weeklySettings : null,
    loading: !isCurrentDate || state.loading,
    error: isCurrentDate ? state.error : null,
  };
}
