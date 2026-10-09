import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  pendingApprovalsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenTrackOrder,
  onOpenAdmin,
  pendingApprovalsCount = 0,
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black">
      {/* Top Streetwear Notice Bar */}
      <div className="bg-black text-white text-[11px] font-mono tracking-widest py-1.5 px-4 flex justify-between items-center overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          TUMBAS MAS // AUTUMN-WINTER 2026 ARCHIVE
        </span>
        <div className="flex items-center gap-6">
          <span>GUNAKAN KODE: <strong className="underline underline-offset-2">MASBEBASONGKIR</strong></span>
          <span className="hidden md:inline">GARANSI PRODUK ORIGINAL 100% HEAVYWEIGHT COTTON</span>
        </div>
        <span className="hidden sm:inline font-mono">JKT-ID // POSTGRESQL VERIFIED</span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectCategory('all')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tighter text-black uppercase font-mono group-hover:opacity-80 transition-opacity">
                  TUMBAS MAS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-white font-bold tracking-widest uppercase">
                  TM®
                </span>
              </div>
              <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">
                Calle de Larache Silhouette // Heavy Luxury
              </p>
            </button>
          </div>

          {/* Desktop Categories */}
          <nav className="hidden lg:flex items-center space-x-1 font-mono text-xs font-bold tracking-wider">
            {[
              { id: 'all', label: 'SEMUA KOLEKSI' },
              { id: 'kaos-boxy', label: 'KAOS BOXY (4)' },
              { id: 'zipper-hoodie', label: 'ZIPPER HOODIE (4)' },
              { id: 'celana-jeans', label: 'CELANA JEANS (4)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-2 transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-black text-white'
                    : 'text-neutral-800 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Input / Trigger */}
            <div className="relative flex items-center">
              {showSearchInput ? (
                <div className="flex items-center border border-black bg-white px-2 py-1">
                  <Search className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Cari kaos, hoodie, jeans..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="w-36 sm:w-52 text-xs font-mono outline-none"
                  />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      onSearchChange('');
                    }}
                    className="text-neutral-400 hover:text-black ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  aria-label="Cari Produk"
                  className="p-2 border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  title="Pencarian Cepat"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Track Order Button */}
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1.5 px-3 py-2 border border-black text-xs font-mono font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
              title="Lacak Status Pesanan & Upload Bukti"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">LACAK ORDER</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`relative flex items-center gap-1.5 px-3 py-2 border border-black text-xs font-mono font-bold transition-colors cursor-pointer ${
                isAdmin
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
              title="Admin Panel & Approval Pembayaran"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isAdmin ? 'ADMIN ACTIVE' : 'ADMIN PANEL'}</span>
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold rounded-full border-2 border-white animate-bounce">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-black text-white text-xs font-mono font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">BAG</span>
              <span className="bg-white text-black px-1.5 py-0.2 text-[11px] font-extrabold rounded-none">
                {totalItemsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Category Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 border-t border-neutral-200 gap-1 font-mono text-[11px] font-bold">
          {[
            { id: 'all', label: 'SEMUA' },
            { id: 'kaos-boxy', label: 'KAOS BOXY' },
            { id: 'zipper-hoodie', label: 'ZIPPER HOODIE' },
            { id: 'celana-jeans', label: 'CELANA JEANS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-black text-white'
                  : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
