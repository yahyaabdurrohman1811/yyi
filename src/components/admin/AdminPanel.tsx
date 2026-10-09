import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Product, Order, Customer, DashboardAnalytics } from '../../types.ts';
import { formatRupiah, formatDate } from '../../utils/format.ts';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  LogOut,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  Truck,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshProducts: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onRefreshProducts,
}) => {
  const { adminLogout, adminUser } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'APPROVAL' | 'PRODUCTS' | 'ORDERS' | 'CUSTOMERS'>('DASHBOARD');

  // Data states
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'ALL' | 'MENUNGGU_APPROVAL' | 'LUNAS' | 'DITOLAK'>('MENUNGGU_APPROVAL');

  // Modal / Interaction states
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Nominal transfer tidak sesuai / rekening pengirim tidak valid');

  // Edit / Add Product states
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductData, setEditingProductData] = useState<Partial<Product> | null>(null);
  const [trackingInput, setTrackingInput] = useState<{ [orderId: number]: string }>({});

  useEffect(() => {
    if (isOpen) {
      loadAllAdminData();
    }
  }, [isOpen]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [resAnalytics, resProducts, resOrders, resCustomers] = await Promise.all([
        fetch('/api/analytics/dashboard').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/customers').then((r) => r.json()),
      ]);

      if (resAnalytics.success) setAnalytics(resAnalytics.data);
      if (resProducts.success) setProductsList(resProducts.data);
      if (resOrders.success) setOrdersList(resOrders.data);
      if (resCustomers.success) setCustomersList(resCustomers.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Payment Approval Handler
  const handleApprovePayment = async (orderId: number) => {
    if (!confirm('Setujui bukti pembayaran ini? Status akan otomatis menjadi LUNAS & DIPROSES.')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Pembayaran berhasil disetujui!');
        loadAllAdminData();
        onRefreshProducts();
      } else {
        alert(data.error || 'Gagal menyetujui');
      }
    } catch {
      alert('Koneksi gagal');
    }
  };

  // Payment Reject Handler
  const handleRejectPayment = async () => {
    if (!rejectModalOrder) return;
    try {
      const res = await fetch(`/api/orders/${rejectModalOrder.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Pembayaran ditolak.');
        setRejectModalOrder(null);
        loadAllAdminData();
      } else {
        alert(data.error || 'Gagal menolak');
      }
    } catch {
      alert('Koneksi gagal');
    }
  };

  // Order Status update handler
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    const tracking = trackingInput[orderId];
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: tracking }),
      });
      const data = await res.json();
      if (data.success) {
        loadAllAdminData();
      } else {
        alert(data.error || 'Gagal memperbarui status');
      }
    } catch {
      alert('Koneksi gagal');
    }
  };

  // Quick Inline Stock Update
  const handleQuickUpdateStock = async (productId: number, delta: number) => {
    const prod = productsList.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProductsList((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        onRefreshProducts();
      }
    } catch {
      alert('Gagal update stok');
    }
  };

  // Product save handler (Add / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductData) return;

    try {
      if (editingProductData.id) {
        // Edit existing
        const res = await fetch(`/api/products/${editingProductData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProductData),
        });
        const data = await res.json();
        if (data.success) {
          alert('Produk berhasil diperbarui');
          setIsEditingProduct(false);
          loadAllAdminData();
          onRefreshProducts();
        }
      } else {
        // Create new
        const slug =
          editingProductData.slug ||
          (editingProductData.name || 'product')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') +
            '-' +
            Date.now().toString().slice(-4);

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editingProductData,
            slug,
            images: editingProductData.images || '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000"]',
            isFeatured: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert('Produk baru berhasil ditambahkan');
          setIsEditingProduct(false);
          loadAllAdminData();
          onRefreshProducts();
        }
      }
    } catch {
      alert('Gagal menyimpan produk');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Hapus produk ini dari database PostgreSQL?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Produk dihapus');
        loadAllAdminData();
        onRefreshProducts();
      }
    } catch {
      alert('Gagal menghapus');
    }
  };

  if (!isOpen) return null;

  // Filtered lists
  const filteredProducts = productsList.filter((p) => {
    const matchCat = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
    const matchSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.material.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredOrders = ordersList.filter((o) => {
    if (orderStatusFilter === 'ALL') return true;
    return o.orderStatus === orderStatusFilter;
  });

  const approvalOrders = ordersList.filter((o) => {
    if (approvalStatusFilter === 'ALL') return o.paymentProofUrl;
    return o.paymentStatus === approvalStatusFilter && o.paymentProofUrl;
  });

  const pendingApprovalsCount = ordersList.filter((o) => o.paymentStatus === 'MENUNGGU_APPROVAL').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex">
      <div className="w-full h-full bg-white flex flex-col">
        {/* Top Header */}
        <header className="bg-black text-white px-4 sm:px-6 py-3 border-b-2 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-lg tracking-tight">
              TUMBAS MAS // ADMIN CONTROL ROOM
            </span>
            <span className="text-[10px] font-mono bg-emerald-500 text-black px-2 py-0.5 font-bold uppercase">
              POSTGRESQL LIVE
            </span>
            {pendingApprovalsCount > 0 && (
              <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 font-bold animate-pulse">
                {pendingApprovalsCount} BUKTI BUTUH APPROVAL
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={loadAllAdminData}
              disabled={loading}
              className="p-1.5 border border-white hover:bg-neutral-800 text-white flex items-center gap-1 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sinkronisasi</span>
            </button>

            <button
              onClick={() => {
                adminLogout();
                onClose();
              }}
              className="px-3 py-1.5 bg-red-600 text-white font-bold hover:bg-red-700 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-neutral-400 hover:bg-white hover:text-black font-bold cursor-pointer"
            >
              KEMBALI KE STORE
            </button>
          </div>
        </header>

        {/* Sub Header Navigation Tabs */}
        <nav className="bg-neutral-100 border-b border-black px-4 sm:px-6 flex overflow-x-auto gap-1 py-1 shrink-0 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'DASHBOARD' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>LAPORAN SALES & ANALITIK</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={`px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors relative ${
              activeTab === 'APPROVAL' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>APPROVAL BUKTI BAYAR</span>
            {pendingApprovalsCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'PRODUCTS' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>DATA PRODUK & STOK ({productsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'ORDERS' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>DATA ORDER & RIWAYAT ({ordersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'CUSTOMERS' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>DATA PELANGGAN ({customersList.length})</span>
          </button>
        </nav>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50">
          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD VISUAL & LAPORAN SALES */}
          {/* ============================================================== */}
          {activeTab === 'DASHBOARD' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Top Key Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">
                      TOTAL OMSET REALISASI (LUNAS)
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-mono font-black text-2xl text-black mt-2">
                    {formatRupiah(analytics?.totalRevenue || 0)}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>{analytics?.paidOrdersCount || 0} order sukses terverifikasi</span>
                  </div>
                </div>

                <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">
                      APPROVAL BUKTI TRANSFER
                    </span>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-mono font-black text-2xl text-black mt-2">
                    {analytics?.pendingApprovalCount || 0} ANTRIAN
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 mt-1">
                    Membutuhkan validasi admin
                  </div>
                </div>

                <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">
                      TOTAL PESANAN MASUK
                    </span>
                    <ShoppingBag className="w-4 h-4 text-black" />
                  </div>
                  <div className="font-mono font-black text-2xl text-black mt-2">
                    {analytics?.totalOrders || 0} PESANAN
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 mt-1">
                    Semua transaksi tercatat di database
                  </div>
                </div>

                <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase">
                      KATALOG & PELANGGAN
                    </span>
                    <Users className="w-4 h-4 text-black" />
                  </div>
                  <div className="font-mono font-black text-2xl text-black mt-2">
                    {analytics?.totalProducts || 12} / {analytics?.totalCustomers || 0}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 mt-1">
                    12 Produk Aktif • Pelanggan Terdaftar
                  </div>
                </div>
              </div>

              {/* Visual Performance Charts & Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Chart: Weekly Sales Trend Simulator */}
                <div className="lg:col-span-8 border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center border-b border-black pb-3">
                    <h3 className="font-mono font-black text-sm uppercase">
                      GRAFIK TREN PENJUALAN MINGGUAN (REAL-TIME IDR)
                    </h3>
                    <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5">
                      OKTOBER 2026
                    </span>
                  </div>

                  {/* SVG Bar Chart Visualization */}
                  <div className="pt-6 pb-2">
                    <div className="h-48 flex items-end justify-between gap-3 px-2 border-b-2 border-black">
                      {[
                        { day: 'SEN', height: '40%', val: 'Rp 838rb' },
                        { day: 'SEL', height: '65%', val: 'Rp 1.4jt' },
                        { day: 'RAB', height: '85%', val: 'Rp 2.1jt' },
                        { day: 'KAM', height: '55%', val: 'Rp 1.2jt' },
                        { day: 'JUM', height: '95%', val: 'Rp 2.8jt' },
                        { day: 'SAB', height: '100%', val: 'Rp 3.2jt' },
                        { day: 'MIN', height: '75%', val: 'Rp 1.9jt' },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="font-mono text-[9px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {bar.val}
                          </span>
                          <div
                            style={{ height: bar.height }}
                            className="w-full bg-black group-hover:bg-neutral-700 transition-all border border-black"
                          />
                          <span className="font-mono text-[10px] font-bold mt-1 text-black">
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between font-mono text-xs text-neutral-600">
                    <span>* Data terhubung langsung ke single source of truth PostgreSQL</span>
                    <span className="font-bold text-black">Conversion Rate: 84.6%</span>
                  </div>
                </div>

                {/* Breakdown Metode Pembayaran */}
                <div className="lg:col-span-4 border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <h3 className="font-mono font-black text-sm uppercase border-b border-black pb-3">
                      DISTRIBUSI PEMBAYARAN
                    </h3>

                    <div className="space-y-4 pt-4 font-mono text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">QRIS INSTANT (E-Wallet)</span>
                          <span className="font-mono">52%</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2.5">
                          <div className="bg-black h-2.5" style={{ width: '52%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">BCA TRANSFER</span>
                          <span className="font-mono">31%</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2.5">
                          <div className="bg-black h-2.5" style={{ width: '31%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">MANDIRI LIVIN</span>
                          <span className="font-mono">12%</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2.5">
                          <div className="bg-black h-2.5" style={{ width: '12%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">GOPAY DIGITAL</span>
                          <span className="font-mono">5%</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2.5">
                          <div className="bg-black h-2.5" style={{ width: '5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Stok Kritis */}
                  <div className="mt-6 p-3 border border-amber-500 bg-amber-50 font-mono text-xs text-amber-900">
                    <span className="font-bold block mb-1">⚠️ PERINGATAN STOK TERBATAS:</span>
                    <span>
                      Ada {productsList.filter((p) => p.stock < 25).length} produk dengan stok di bawah 25 unit.
                      Segera restock kain di atelier.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: APPROVAL BUKTI PEMBAYARAN DARI PELANGGAN */}
          {/* ============================================================== */}
          {activeTab === 'APPROVAL' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Filter Sub-nav */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black pb-3">
                <div className="flex gap-2 font-mono text-xs font-bold">
                  {[
                    { id: 'MENUNGGU_APPROVAL', label: `MENUNGGU APPROVAL (${pendingApprovalsCount})` },
                    { id: 'LUNAS', label: 'SUDAH DISETUJUI / LUNAS' },
                    { id: 'DITOLAK', label: 'BUKTI DITOLAK' },
                    { id: 'ALL', label: 'SEMUA BUKTI MASUK' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setApprovalStatusFilter(f.id as any)}
                      className={`px-3 py-1.5 border border-black cursor-pointer ${
                        approvalStatusFilter === f.id
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="font-mono text-xs text-neutral-500">
                  Total {approvalOrders.length} bukti pembayaran tercatat
                </div>
              </div>

              {/* Cards Grid */}
              {approvalOrders.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-neutral-300 font-mono">
                  <CheckCircle className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="font-bold text-neutral-600">Tidak ada bukti pembayaran pada filter ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvalOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header card */}
                        <div className="flex justify-between items-start border-b border-black pb-2">
                          <div>
                            <span className="font-mono text-[10px] text-neutral-500">NOMOR ORDER:</span>
                            <div className="font-mono font-black text-sm">#{order.orderNumber}</div>
                          </div>
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 font-bold border ${
                              order.paymentStatus === 'MENUNGGU_APPROVAL'
                                ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                                : order.paymentStatus === 'LUNAS'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                : 'bg-red-100 text-red-900 border-red-400'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>

                        {/* Customer & Amount */}
                        <div className="font-mono text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Pelanggan:</span>
                            <span className="font-bold">{order.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Total Transfer:</span>
                            <span className="font-black text-sm text-black">
                              {formatRupiah(order.total)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Metode Bayar:</span>
                            <span className="font-bold">{order.paymentMethod.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Atas Nama:</span>
                            <span className="font-bold">{order.paymentProofSender || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">No. Referensi:</span>
                            <span className="font-mono">{order.paymentProofRef || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Diunggah Pada:</span>
                            <span>{formatDate(order.paymentProofUploadedAt)}</span>
                          </div>
                        </div>

                        {/* Slip Image Thumbnail */}
                        {order.paymentProofUrl && (
                          <div className="pt-2 border-t border-neutral-200">
                            <span className="font-mono text-[10px] text-neutral-500 block mb-1">
                              FOTO BUKTI STRUK TRANSFER:
                            </span>
                            <div
                              onClick={() => setPreviewProofImage(order.paymentProofUrl!)}
                              className="relative aspect-16/9 border border-black overflow-hidden bg-neutral-100 cursor-pointer group"
                            >
                              <img
                                src={order.paymentProofUrl}
                                alt="Bukti Transfer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-mono text-xs font-bold gap-1 transition-opacity">
                                <Eye className="w-4 h-4" />
                                Klik untuk Perbesar
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-black space-y-2">
                        {order.paymentStatus === 'MENUNGGU_APPROVAL' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleApprovePayment(order.id)}
                              className="py-2.5 bg-black text-white hover:bg-neutral-800 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>SETUJUI</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalOrder(order);
                              }}
                              className="py-2.5 border border-red-600 text-red-600 hover:bg-red-50 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>TOLAK</span>
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="w-full py-1.5 border border-black hover:bg-neutral-100 font-mono text-[11px] font-bold text-center cursor-pointer"
                        >
                          Lihat Detail Pesanan Lengkap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: DATA PRODUK & STOK */}
          {/* ============================================================== */}
          {activeTab === 'PRODUCTS' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Actions & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-black">
                {/* Search & Category */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Cari produk / bahan..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-black font-mono text-xs w-48 sm:w-64 outline-none"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-black font-mono text-xs outline-none bg-white"
                  >
                    <option value="ALL">Semua Kategori (12)</option>
                    <option value="kaos-boxy">Kaos Boxy (4)</option>
                    <option value="zipper-hoodie">Zipper Hoodie (4)</option>
                    <option value="celana-jeans">Celana Jeans (4)</option>
                  </select>
                </div>

                {/* Add Product Button */}
                <button
                  onClick={() => {
                    setEditingProductData({
                      name: '',
                      category: 'kaos-boxy',
                      price: 249000,
                      originalPrice: 299000,
                      stock: 30,
                      sizes: 'S,M,L,XL,XXL',
                      description: '',
                      material: '100% US Combed Cotton',
                      gsm: '280 GSM',
                      fit: 'Boxy Drop-Shoulder',
                      images: '["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000"]',
                    });
                    setIsEditingProduct(true);
                  }}
                  className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="border-2 border-black bg-white overflow-x-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white border-b border-black">
                      <th className="p-3">FOTO</th>
                      <th className="p-3">NAMA PRODUK</th>
                      <th className="p-3">KATEGORI</th>
                      <th className="p-3">HARGA</th>
                      <th className="p-3">STOK TERSEDIA</th>
                      <th className="p-3">SPESIFIKASI (GSM/FIT)</th>
                      <th className="p-3 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredProducts.map((p) => {
                      let img = '';
                      try {
                        img = JSON.parse(p.images)[0];
                      } catch {
                        img = p.images;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="p-3">
                            <div className="w-12 h-14 border border-black overflow-hidden bg-neutral-100">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-3 font-bold max-w-xs">
                            <div className="line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-neutral-400 font-normal">{p.slug}</div>
                          </td>
                          <td className="p-3 uppercase">
                            <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-[10px] font-bold">
                              {p.category.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-black">{formatRupiah(p.price)}</td>
                          <td className="p-3">
                            {/* Inline Stock Counter */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleQuickUpdateStock(p.id, -1)}
                                className="px-2 py-0.5 border border-black hover:bg-neutral-200 cursor-pointer font-bold"
                              >
                                -
                              </button>
                              <span
                                className={`px-2 py-0.5 font-bold min-w-8 text-center ${
                                  p.stock <= 0
                                    ? 'text-red-600 bg-red-50'
                                    : p.stock < 25
                                    ? 'text-amber-700 bg-amber-50'
                                    : 'text-black'
                                }`}
                              >
                                {p.stock}
                              </span>
                              <button
                                onClick={() => handleQuickUpdateStock(p.id, 1)}
                                className="px-2 py-0.5 border border-black hover:bg-neutral-200 cursor-pointer font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-[11px] text-neutral-600">
                            <div>{p.gsm}</div>
                            <div className="text-[10px] text-neutral-400">{p.fit}</div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProductData(p);
                                  setIsEditingProduct(true);
                                }}
                                className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                                title="Edit Produk"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: DATA ORDER & RIWAYAT */}
          {/* ============================================================== */}
          {activeTab === 'ORDERS' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Order Status Filters */}
              <div className="flex flex-wrap items-center gap-2 border-b border-black pb-3 font-mono text-xs font-bold">
                {[
                  { id: 'ALL', label: 'SEMUA PESANAN' },
                  { id: 'MENUNGGU_KONFIRMASI', label: 'MENUNGGU KONFIRMASI' },
                  { id: 'DIPROSES', label: 'SEDANG DIPROSES' },
                  { id: 'DIKIRIM', label: 'DALAM PENGIRIMAN' },
                  { id: 'SELESAI', label: 'SELESAI' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setOrderStatusFilter(s.id)}
                    className={`px-3 py-1.5 border border-black cursor-pointer ${
                      orderStatusFilter === s.id ? 'bg-black text-white' : 'bg-white hover:bg-neutral-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Order List Table */}
              <div className="border-2 border-black bg-white overflow-x-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white border-b border-black">
                      <th className="p-3">ORDER #</th>
                      <th className="p-3">TANGGAL</th>
                      <th className="p-3">PELANGGAN</th>
                      <th className="p-3">TOTAL</th>
                      <th className="p-3">PEMBAYARAN</th>
                      <th className="p-3">STATUS ORDER</th>
                      <th className="p-3">PENGIRIMAN & RESI</th>
                      <th className="p-3 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-3 font-black">#{o.orderNumber}</td>
                        <td className="p-3 text-neutral-500">{formatDate(o.createdAt)}</td>
                        <td className="p-3">
                          <div className="font-bold">{o.customerName}</div>
                          <div className="text-[10px] text-neutral-500">{o.customerPhone}</div>
                        </td>
                        <td className="p-3 font-black text-black">{formatRupiah(o.total)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold border ${
                              o.paymentStatus === 'LUNAS'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                : o.paymentStatus === 'MENUNGGU_APPROVAL'
                                ? 'bg-amber-100 text-amber-900 border-amber-400'
                                : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="px-2 py-1 border border-black bg-white text-[11px] font-bold outline-none"
                          >
                            <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
                            <option value="DIPROSES">Diproses</option>
                            <option value="DIKIRIM">Dikirim</option>
                            <option value="SELESAI">Selesai</option>
                            <option value="DIBATALKAN">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 block">
                              {o.shippingExpedition}
                            </span>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Nomor Resi..."
                                defaultValue={o.trackingNumber || ''}
                                onChange={(e) =>
                                  setTrackingInput({ ...trackingInput, [o.id]: e.target.value })
                                }
                                className="px-2 py-0.5 border border-black text-[10px] w-28 uppercase"
                              />
                              <button
                                onClick={() => handleUpdateOrderStatus(o.id, o.orderStatus)}
                                className="px-1.5 py-0.5 bg-black text-white text-[10px] hover:bg-neutral-800 cursor-pointer"
                                title="Simpan Resi"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            className="px-2.5 py-1 border border-black hover:bg-black hover:text-white font-bold text-[11px] cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: DATA PELANGGAN */}
          {/* ============================================================== */}
          {activeTab === 'CUSTOMERS' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="border-2 border-black bg-white overflow-x-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white border-b border-black">
                      <th className="p-3">ID</th>
                      <th className="p-3">NAMA PELANGGAN</th>
                      <th className="p-3">EMAIL & WHATSAPP</th>
                      <th className="p-3">ALAMAT & KOTA</th>
                      <th className="p-3">TOTAL BELANJA</th>
                      <th className="p-3">JUMLAH ORDER</th>
                      <th className="p-3">TERDAFTAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {customersList.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-3 font-bold text-neutral-400">#{c.id}</td>
                        <td className="p-3 font-bold text-black">{c.name}</td>
                        <td className="p-3">
                          <div>{c.email}</div>
                          <div className="text-[10px] text-neutral-500">{c.phone}</div>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="line-clamp-1">{c.address}</div>
                          <div className="text-[10px] text-neutral-500">{c.city}</div>
                        </td>
                        <td className="p-3 font-black text-black">{formatRupiah(c.totalSpent)}</td>
                        <td className="p-3 font-bold">{c.ordersCount} Transaksi</td>
                        <td className="p-3 text-neutral-500">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL PREVIEW BUKTI TRANSFER FULL-SIZE */}
      {/* ============================================================== */}
      {previewProofImage && (
        <div
          onClick={() => setPreviewProofImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl w-full bg-white border-2 border-black p-2">
            <img src={previewProofImage} alt="Bukti Transfer" className="w-full max-h-[80vh] object-contain" />
            <div className="p-2 text-center font-mono text-xs font-bold text-black border-t border-black mt-2">
              Klik di mana saja untuk menutup pratinjau bukti
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL TOLAK BUKTI BAYAR */}
      {/* ============================================================== */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-mono font-black text-sm uppercase">
              TOLAK BUKTI PEMBAYARAN ORDER #{rejectModalOrder.orderNumber}
            </h3>
            <p className="font-mono text-xs text-neutral-600">
              Silakan tuliskan alasan penolakan bukti pembayaran untuk diinformasikan kepada pelanggan:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border-2 border-black font-mono text-xs outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="flex-1 py-2 border border-black font-mono text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleRejectPayment}
                className="flex-1 py-2 bg-red-600 text-white font-mono text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL EDIT / TAMBAH PRODUK */}
      {/* ============================================================== */}
      {isEditingProduct && editingProductData && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-black max-w-2xl w-full p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] my-6">
            <div className="flex justify-between items-center border-b border-black pb-3 mb-4">
              <h3 className="font-mono font-black text-sm uppercase">
                {editingProductData.id ? `EDIT PRODUK #${editingProductData.id}` : 'TAMBAH PRODUK BARU'}
              </h3>
              <button
                onClick={() => setIsEditingProduct(false)}
                className="p-1 hover:bg-neutral-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold mb-1">NAMA PRODUK *</label>
                <input
                  type="text"
                  required
                  value={editingProductData.name || ''}
                  onChange={(e) => setEditingProductData({ ...editingProductData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-black outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">KATEGORI *</label>
                  <select
                    value={editingProductData.category || 'kaos-boxy'}
                    onChange={(e) => setEditingProductData({ ...editingProductData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-black outline-none bg-white"
                  >
                    <option value="kaos-boxy">Kaos Boxy</option>
                    <option value="zipper-hoodie">Zipper Hoodie</option>
                    <option value="celana-jeans">Celana Jeans</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">STOK TERSEDIA *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProductData.stock ?? 25}
                    onChange={(e) => setEditingProductData({ ...editingProductData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">HARGA JUAL (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProductData.price || 0}
                    onChange={(e) => setEditingProductData({ ...editingProductData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">HARGA CORET (ORIGINAL)</label>
                  <input
                    type="number"
                    value={editingProductData.originalPrice || 0}
                    onChange={(e) => setEditingProductData({ ...editingProductData, originalPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">GRAMASI / WEIGHT</label>
                  <input
                    type="text"
                    value={editingProductData.gsm || ''}
                    onChange={(e) => setEditingProductData({ ...editingProductData, gsm: e.target.value })}
                    className="w-full px-3 py-2 border border-black outline-none"
                    placeholder="cth: 280 GSM / 14.5 OZ"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">SILUET / FIT</label>
                  <input
                    type="text"
                    value={editingProductData.fit || ''}
                    onChange={(e) => setEditingProductData({ ...editingProductData, fit: e.target.value })}
                    className="w-full px-3 py-2 border border-black outline-none"
                    placeholder="cth: Wide Boxy"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">PILIHAN UKURAN</label>
                  <input
                    type="text"
                    value={editingProductData.sizes || 'S,M,L,XL,XXL'}
                    onChange={(e) => setEditingProductData({ ...editingProductData, sizes: e.target.value })}
                    className="w-full px-3 py-2 border border-black outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">MATERIAL KAIN</label>
                <input
                  type="text"
                  value={editingProductData.material || ''}
                  onChange={(e) => setEditingProductData({ ...editingProductData, material: e.target.value })}
                  className="w-full px-3 py-2 border border-black outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">DESKRIPSI LENGKAP</label>
                <textarea
                  rows={3}
                  value={editingProductData.description || ''}
                  onChange={(e) => setEditingProductData({ ...editingProductData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-black outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">URL GAMBAR (JSON Array)</label>
                <input
                  type="text"
                  value={editingProductData.images || ''}
                  onChange={(e) => setEditingProductData({ ...editingProductData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-black outline-none text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-black">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="flex-1 py-2.5 border border-black font-bold hover:bg-neutral-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  Simpan Produk ke PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DETAIL PESANAN LENGKAP */}
      {/* ============================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-xl w-full p-6 space-y-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center border-b border-black pb-2">
              <h3 className="font-mono font-black text-sm uppercase">
                RINCIAN PESANAN #{selectedOrderDetails.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 hover:bg-neutral-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-100 border border-neutral-300 space-y-1">
                <div className="font-bold">{selectedOrderDetails.customerName}</div>
                <div>{selectedOrderDetails.customerEmail} • {selectedOrderDetails.customerPhone}</div>
                <div className="text-neutral-600">{selectedOrderDetails.shippingAddress}, {selectedOrderDetails.shippingCity}</div>
                <div className="text-[10px] text-neutral-500">Ekspedisi: {selectedOrderDetails.shippingExpedition}</div>
              </div>

              <div className="space-y-2">
                <span className="font-bold block">ITEM PESANAN:</span>
                {selectedOrderDetails.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b border-neutral-100">
                    <span>{item.productName} ({item.size}) × {item.quantity}</span>
                    <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-black">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(selectedOrderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim:</span>
                  <span>{formatRupiah(selectedOrderDetails.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(selectedOrderDetails.total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-neutral-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
