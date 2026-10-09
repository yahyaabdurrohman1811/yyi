import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  isAdmin: boolean;
  adminUser: { name: string; email: string; role: string } | null;
  adminLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  currentUser: User | null;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('tumbas_mas_admin_token') === 'admin-tumbas-master-key';
  });

  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    const saved = localStorage.getItem('tumbas_mas_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const adminLogin = async (password: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('tumbas_mas_admin_token', data.token);
        localStorage.setItem('tumbas_mas_admin_user', JSON.stringify(data.user));
        setIsAdmin(true);
        setAdminUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Password admin salah' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Koneksi ke server gagal' };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('tumbas_mas_admin_token');
    localStorage.removeItem('tumbas_mas_admin_user');
    setIsAdmin(false);
    setAdminUser(null);
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminUser,
        adminLogin,
        adminLogout,
        currentUser,
        loginWithGoogle,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
