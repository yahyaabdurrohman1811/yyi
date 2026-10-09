import React, { useState } from 'react';
import { Order } from '../types.ts';
import { formatRupiah, formatDate } from '../utils/format.ts';
import { X, Search, Truck, CheckCircle2, Clock, AlertTriangle, Upload, Package } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [orderQuery, setOrderQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick proof upload states
  const [showUploadProof, setShowUploadProof] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderQuery.trim().toUpperCase()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Nomor order tidak ditemukan dalam sistem database.');
        setOrder(null);
      }
    } catch {
      setError('Gagal menghubungi server database.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !proofUrl) return;

    setIsUploading(true);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofUrl,
          senderName: senderName || order.customerName,
          referenceNumber: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setUploadSuccess(true);
        setShowUploadProof(false);
      } else {
        alert(data.error || 'Gagal mengirim bukti pembayaran.');
      }
    } catch {
      alert('Koneksi gagal');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MENUNGGU_KONFIRMASI':
        return <span className="bg-amber-100 text-amber-900 border border-amber-400 px-2 py-0.5 font-bold">MENUNGGU KONFIRMASI</span>;
      case 'DIPROSES':
        return <span className="bg-blue-100 text-blue-900 border border-blue-400 px-2 py-0.5 font-bold">SEDANG DIPROSES</span>;
      case 'DIKIRIM':
        return <span className="bg-purple-100 text-purple-900 border border-purple-400 px-2 py-0.5 font-bold">DALAM PENGIRIMAN</span>;
      case 'SELESAI':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 font-bold">SELESAI</span>;
      case 'DIBATALKAN':
        return <span className="bg-red-100 text-red-900 border border-red-400 px-2 py-0.5 font-bold">DIBATALKAN</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
      <div className="relative bg-white border-2 border-black max-w-2xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] my-6">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-black flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <h2 className="font-mono font-black text-sm uppercase tracking-wider">
              LACAK STATUS PESANAN (REAL-TIME)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Search Input */}
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Masukkan Nomor Order (cth: TM-20261008-001)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-black font-mono text-xs uppercase outline-none focus:bg-neutral-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-black text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? 'MENCARI...' : 'LACAK'}
            </button>
          </form>

          {/* Quick Demo Order Suggestions */}
          {!order && (
            <div className="font-mono text-[11px] text-neutral-500 flex flex-wrap items-center gap-2">
              <span>Coba order contoh:</span>
              <button
                type="button"
                onClick={() => setOrderQuery('TM-20261008-001')}
                className="underline hover:text-black cursor-pointer font-bold"
              >
                TM-20261008-001 (Menunggu Approval)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setOrderQuery('TM-20261006-003')}
                className="underline hover:text-black cursor-pointer font-bold"
              >
                TM-20261006-003 (Dalam Pengiriman)
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 border border-red-500 bg-red-50 text-red-800 font-mono text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Found Result */}
          {order && (
            <div className="space-y-5 font-mono text-xs">
              {/* Order Info Card */}
              <div className="p-4 border-2 border-black bg-neutral-50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-2">
                  <div>
                    <span className="text-[10px] text-neutral-500">NOMOR ORDER:</span>
                    <h3 className="text-base font-black text-black">#{order.orderNumber}</h3>
                  </div>
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">TANGGAL:</span>
                    <span className="font-bold">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">PENERIMA:</span>
                    <span className="font-bold">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">METODE BAYAR:</span>
                    <span className="font-bold">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">STATUS PEMBAYARAN:</span>
                    <span
                      className={`font-black ${
                        order.paymentStatus === 'LUNAS'
                          ? 'text-emerald-700'
                          : order.paymentStatus === 'MENUNGGU_APPROVAL'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Resi Pengiriman jika sudah dikirim */}
                {order.trackingNumber && (
                  <div className="p-2.5 bg-purple-50 border border-purple-400 text-purple-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] block font-bold">NOMOR RESI ({order.shippingExpedition}):</span>
                      <span className="text-sm font-black tracking-wider">{order.trackingNumber}</span>
                    </div>
                    <span className="text-[10px] bg-purple-900 text-white px-2 py-0.5 font-bold">
                      TERVERIFIKASI KURIR
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="border border-black p-3 space-y-2 bg-white">
                <span className="font-bold text-[11px] block border-b border-neutral-200 pb-1">
                  RINCIAN ITEM ({order.items?.length || 0}):
                </span>
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-10 border border-black overflow-hidden bg-neutral-100 shrink-0">
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-xs line-clamp-1">{item.productName}</span>
                        <span className="text-[10px] text-neutral-500">
                          Size: {item.size} × {item.quantity} pcs
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-xs">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-black flex justify-between font-black text-sm">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
              </div>

              {/* Upload Bukti Action if Pending */}
              {order.paymentStatus !== 'LUNAS' && (
                <div className="p-3 border-2 border-black bg-amber-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-black text-xs block">
                        {order.paymentStatus === 'MENUNGGU_APPROVAL'
                          ? 'BUKTI PEMBAYARAN TELAH DIUNGGAH (MENUNGGU APPROVAL ADMIN)'
                          : 'BELUM MENGUNGGAH BUKTI PEMBAYARAN?'}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        {order.paymentStatus === 'MENUNGGU_APPROVAL'
                          ? 'Admin akan memvalidasi bukti transfer dalam waktu singkat.'
                          : 'Unggah bukti transfer Anda agar pesanan segera divalidasi dan diproses.'}
                      </span>
                    </div>
                    {order.paymentStatus !== 'MENUNGGU_APPROVAL' && !showUploadProof && (
                      <button
                        onClick={() => setShowUploadProof(true)}
                        className="px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase hover:bg-neutral-800 cursor-pointer"
                      >
                        Unggah Bukti
                      </button>
                    )}
                  </div>

                  {showUploadProof && (
                    <form onSubmit={handleSubmitProof} className="pt-2 border-t border-amber-300 space-y-2">
                      <input
                        type="text"
                        placeholder="Nama Pemilik Rekening Pengirim"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-2 py-1.5 border border-black bg-white text-xs outline-none"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleProofImageChange}
                        className="w-full text-[11px]"
                      />
                      <button
                        type="submit"
                        disabled={isUploading || !proofUrl}
                        className="w-full py-2 bg-black text-white font-bold text-xs uppercase hover:bg-neutral-800 cursor-pointer disabled:opacity-40"
                      >
                        {isUploading ? 'Mengunggah...' : 'Kirim Bukti Sekarang'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
