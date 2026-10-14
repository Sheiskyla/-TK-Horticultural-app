import { useState, useEffect, useCallback, useRef } from 'react';
import { laravelApi } from '../services/laravelApi';

export function useLaravelUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
  });
  const mountedRef = useRef(true);

  const fetchUsers = useCallback(async (params = {}) => {
    setError(null);
    try {
      const data = await laravelApi.getAdminUsers(params);
      if (!mountedRef.current) return;
      setUsers(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 50,
        total: data.total || 0,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    mountedRef.current = true;
    setTimeout(() => {
      if (mountedRef.current) {
        setLoading(true);
        fetchUsers();
      }
    }, 0);
    return () => { mountedRef.current = false; };
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    refresh,
  };
}

export function useLaravelGallery(admin = false) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = admin
        ? await laravelApi.getAdminGallery()
        : await laravelApi.getGallery();
      if (mountedRef.current) setDocuments(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setDocuments([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = window.setTimeout(() => fetchGallery(), 0);
    return () => {
      window.clearTimeout(timer);
      mountedRef.current = false;
    };
  }, [fetchGallery]);

  return { documents, loading, error, refresh: fetchGallery };
}

export function useLaravelAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchDashboard = useCallback(async () => {
    setError(null);
    try {
      const result = await laravelApi.getAdminDashboard();
      if (!mountedRef.current) return;
      setData(result);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to fetch dashboard');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setTimeout(() => {
      if (mountedRef.current) {
        setLoading(true);
        fetchDashboard();
      }
    }, 0);
    return () => { mountedRef.current = false; };
  }, [fetchDashboard]);

  return { data, loading, error, refresh: fetchDashboard };
}

export function useLaravelBookings(params = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const mountedRef = useRef(true);

  const fetchBookings = useCallback(async (queryParams = {}) => {
    setError(null);
    try {
      const data = await laravelApi.getAdminBookings(queryParams);
      if (!mountedRef.current) return;
      setBookings(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setTimeout(() => {
      if (mountedRef.current) {
        setLoading(true);
        fetchBookings(params);
      }
    }, 0);
    return () => { mountedRef.current = false; };
  }, [fetchBookings, params]);

  return { bookings, loading, error, pagination, fetchBookings, refresh: () => { setLoading(true); fetchBookings(params); } };
}

export function useLaravelEnquiries(params = {}) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const mountedRef = useRef(true);

  const fetchEnquiries = useCallback(async (queryParams = {}) => {
    setError(null);
    try {
      const data = await laravelApi.getAdminEnquiries(queryParams);
      if (!mountedRef.current) return;
      setEnquiries(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to fetch enquiries');
      setEnquiries([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setTimeout(() => {
      if (mountedRef.current) {
        setLoading(true);
        fetchEnquiries(params);
      }
    }, 0);
    return () => { mountedRef.current = false; };
  }, [fetchEnquiries, params]);

  return { enquiries, loading, error, pagination, fetchEnquiries, refresh: () => { setLoading(true); fetchEnquiries(params); } };
}

export function useLaravelAdminBookings() {
  const stableParams = useRef({});
  return useLaravelBookings(stableParams.current);
}

export function useLaravelAdminEnquiries() {
  const stableParams = useRef({});
  return useLaravelEnquiries(stableParams.current);
}

export function useLaravelAvailability(date) {
  const [data, setData] = useState({ date: null, weekday: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const result = await laravelApi.getAdminAvailability(date);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const timer = window.setTimeout(() => refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  return { ...data, loading, error, refresh };
}