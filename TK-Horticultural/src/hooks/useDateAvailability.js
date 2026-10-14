import { useEffect, useState } from 'react';
import laravelApi from '../services/laravelApi';

export const BOOKING_SLOTS = [
  { id: 'slot-1', field: 'slot-1', label: '9am–12pm' },
  { id: 'slot-2', field: 'slot-2', label: '12pm–3pm' },
  { id: 'slot-3', field: 'slot-3', label: '3pm–6pm' },
];

export function weekdayAvailabilityId(date) {
  return String(new Date(`${date}T12:00:00`).getDay());
}

export function isSlotAvailable(dateSettings, weeklySettings, field) {
  return dateSettings?.[field] !== 'Blocked' && weeklySettings?.[field] !== 'Blocked';
}

export default function useDateAvailability(date) {
  const [state, setState] = useState({
    date: null, dateSettings: null, weeklySettings: null, loading: true, error: null,
  });

  useEffect(() => {
    if (!date) return undefined;
    let active = true;
    const timer = window.setTimeout(() => {
      laravelApi.getAvailability({ date })
        .then((slots) => {
          if (!active) return;
          setState({
            date,
            dateSettings: Object.fromEntries(slots.map((slot) => [slot.id, slot.status])),
            weeklySettings: null,
            loading: false,
            error: null,
          });
        })
        .catch((error) => {
          console.error(`Unable to load availability for ${date}:`, error);
          if (active) setState({ date, dateSettings: null, weeklySettings: null, loading: false, error });
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
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
