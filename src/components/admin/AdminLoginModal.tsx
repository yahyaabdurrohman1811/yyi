import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { adminLogin, loginWithGoogle } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await adminLogin(password);
    setLoading(false);

    if (res.success) {
      setPassword('');
      onSuccess();
    } else {
      setError(res.error || 'Password admin salah');
    }
  };

  const handleQuickDemoFill = () => {
    setPassword('admin');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="relative bg-white border-2 border-black max-w-md w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-black flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-mono font-bold text-sm uppercase tracking-wider">
              TUMBAS MAS // ADMIN PORTAL
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 border-2 border-black mx-auto flex items-center justify-center bg-neutral-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Lock className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-mono font-black text-base uppercase mt-3">Autentikasi Administrator</h3>
            <p className="font-mono text-xs text-neutral-500">
              Kelola stok, pesanan, approval bukti transfer, dan laporan sales.
            </p>
          </div>

          {error && (
            <div className="p-3 border border-red-500 bg-red-50 text-red-800 font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                MASTER ADMIN PASSWORD:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Masukkan password admin..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-black outline-none focus:bg-neutral-50"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 absolute right-3 top-3 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? 'MEMVERIFIKASI...' : 'MASUK KE ADMIN PANEL'}
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="p-3 border border-dashed border-neutral-400 bg-neutral-50 font-mono text-xs space-y-1 text-center">
            <span className="text-neutral-500 block text-[11px]">Password default pengelola:</span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="font-bold underline text-black hover:text-neutral-700 cursor-pointer"
            >
              Gunakan Password: "admin"
            </button>
          </div>

          {/* Google Sign In option */}
          <div className="pt-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full py-2.5 border border-black hover:bg-neutral-100 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login dengan Google Workspace (OAuth)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
