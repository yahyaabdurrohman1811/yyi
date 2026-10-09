/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Order } from './types.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FastCheckoutModal } from './components/FastCheckoutModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';
import { Footer } from './components/Footer.tsx';
import { Filter, ArrowUpDown, RefreshCw, Layers } from 'lucide-react';

function MainStoreContent() {
  const { isAdmin } = useAuth();

  // Products & Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<{
    product: Product;
    size: string;
    quantity: number;
  } | null>(null);

  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Stats
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  // Fetch products from PostgreSQL backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders count for pending approvals badge
  const fetchPendingApprovals = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        const pending = data.data.filter(
          (o: Order) => o.paymentStatus === 'MENUNGGU_APPROVAL'
        ).length;
        setPendingApprovalsCount(pending);
      }
    } catch (e) {
      console.warn('Pending count note:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPendingApprovals();
  }, []);

  // Filter & Sort logic
  const filteredProducts = products
    .filter((product) => {
      const matchCat =
        activeCategory === 'all' || product.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return a.id - b.id;
    });

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleDirectBuy = (product: Product, size: string, quantity: number) => {
    setDirectCheckoutItem({ product, size, quantity });
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const categoryTitles: Record<string, string> = {
    all: 'SEMUA KOLEKSI STREETWEAR (12 PRODUK)',
    'kaos-boxy': 'KAOS BOXY HEAVYWEIGHT (4 RILISAN)',
    'zipper-hoodie': 'ZIPPER HOODIE FLEECE 480GSM (4 RILISAN)',
    'celana-jeans': 'CELANA JEANS RAW SELVEDGE & BAGGY (4 RILISAN)',
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Hero Section */}
      <HeroSection onSelectCategory={setActiveCategory} />

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Section Header & Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black pb-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1">
              <Layers className="w-4 h-4 text-black" />
              <span>KATALOG RESMI // CALLE DE LARACHE INFLUENCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight uppercase text-black">
              {categoryTitles[activeCategory] || 'KOLEKSI PRODUK'}
            </h2>
          </div>

          {/* Filter & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Category pills */}
            <div className="flex items-center border border-black bg-neutral-50 p-1">
              <span className="text-[10px] text-neutral-500 px-2 font-bold hidden sm:inline">
                KATEGORI:
              </span>
              {[
                { id: 'all', label: 'SEMUA' },
                { id: 'kaos-boxy', label: 'KAOS BOXY' },
                { id: 'zipper-hoodie', label: 'ZIP HOODIE' },
                { id: 'celana-jeans', label: 'JEANS' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition-colors ${
                    activeCategory === c.id
                      ? 'bg-black text-white'
                      : 'text-neutral-700 hover:text-black'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Sorting dropdown */}
            <div className="flex items-center border border-black bg-white px-2 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 mr-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-mono font-bold bg-transparent outline-none cursor-pointer"
              >
                <option value="default">Urutan Default</option>
                <option value="price_asc">Harga: Termurah</option>
                <option value="price_desc">Harga: Termahal</option>
                <option value="stock">Stok Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center font-mono space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black" />
            <p className="text-sm font-bold uppercase tracking-wider">
              MEMUAT 12 PRODUK DARI POSTGRESQL DATABASE...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-black font-mono space-y-3">
            <p className="text-base font-bold uppercase">
              Tidak ada produk yang cocok dengan "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-neutral-800 cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {/* Lookbook Banner Quote */}
        <div className="mt-16 border-2 border-black p-8 bg-black text-white font-mono flex flex-col md:flex-row items-center justify-between gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-[10px] text-neutral-400 tracking-widest uppercase">
              THE DESIGN MANIFESTO // 2026
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              "BENTUK KAKU DAN TEBAL ADALAH DEFINISI KEMEWAHAN STREETWEAR BARU."
            </h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Setiap helai kain diuji ketahanan shrinkage dan gramasi minimal 280 GSM untuk kaos, serta 480 GSM untuk hoodie zipper.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsTrackOrderOpen(true)}
              className="px-6 py-3 border border-white text-white font-bold text-xs uppercase hover:bg-white hover:text-black transition-colors cursor-pointer text-center"
            >
              Cek Status Resi Anda
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 transition-colors cursor-pointer text-center"
            >
              Kembali Ke Atas
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={setActiveCategory}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDirectCheckout={handleDirectBuy}
      />

      {/* Cart Drawer */}
      <CartDrawer
        onStartCheckout={() => {
          setDirectCheckoutItem(null);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Fast Checkout Modal */}
      <FastCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItem(null);
        }}
        directBuyItem={directCheckoutItem}
        onOrderSuccess={(order) => {
          fetchPendingApprovals();
          fetchProducts();
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Admin Full Control Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onRefreshProducts={() => {
          fetchProducts();
          fetchPendingApprovals();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainStoreContent />
      </CartProvider>
    </AuthProvider>
  );
}
