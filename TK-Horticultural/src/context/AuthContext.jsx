import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authContextCore';
import { api } from '../services/api';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const token = api.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded.id,
        email: decoded.email,
        is_admin: decoded.is_admin,
        name: decoded.email.split('@')[0],
        displayName: decoded.email.split('@')[0],
        uid: decoded.id,
      };
    } catch {
      api.setToken(null);
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    setCurrentUser({ ...response.user, displayName: response.user.name, uid: response.user.id });
    return response;
  };

  const signup = async (email, password, displayName, phone = '', address = '') => {
    const response = await api.register({
      name: displayName,
      email,
      password,
      password_confirmation: password,
      phone,
      address,
    });
    setCurrentUser({ ...response.user, displayName: response.user.name, uid: response.user.id });
    return response;
  };

  const loginWithGoogle = async (credential) => {
    const response = await api.loginWithGoogleToken(credential);
    setCurrentUser({ ...response.user, displayName: response.user.name, uid: response.user.id });
    return response;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setCurrentUser(null);
      api.setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, loginWithGoogle, logout }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Loading TK Horticultural Services...
          </p>
        </div>
      )}
    </AuthContext.Provider>
  );
}
