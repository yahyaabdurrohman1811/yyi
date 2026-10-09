import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { Product, Order } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  Upload,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FastCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  directBuyItem?: { product: Product; size: string; quantity: number } | null;
  onOrderSuccess: (order: Order) => void;
}

export const FastCheckoutModal: React.FC<FastCheckoutModalProps> = ({
  isOpen,
  onClose,
  directBuyItem,
  onOrderSuccess,
}) => {
  const { items: cartItems, subtotal: cartSubtotal, discount: cartDiscount, shippingFee: cartShipping, total: cartTotal, clearCart } = useCart();

  // If direct buy, calculate single item values
  const itemsToCheckout = directBuyItem
    ? [
        {
          product: directBuyItem.product,
          size: directBuyItem.size,
          quantity: directBuyItem.quantity,
        },
      ]
    : cartItems;

  const subtotal = directBuyItem
    ? directBuyItem.product.price * directBuyItem.quantity
    : cartSubtotal;
  const shippingFee = directBuyItem ? 20000 : cartShipping;
  const discount = directBuyItem ? 0 : cartDiscount;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Jakarta Selatan');
  const [shippingExpedition, setShippingExpedition] = useState('JNE Reguler');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS_INSTANT' | 'BCA_TRANSFER' | 'MANDIRI_TRANSFER' | 'GOPAY'>('QRIS_INSTANT');

  // Checkout flow state: 'FORM' -> 'CONFIRM_PAYMENT'
  const [step, setStep] = useState<'FORM' | 'PAYMENT'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Proof upload states
  const [proofFileUrl, setProofFileUrl] = useState<string>('');
  const [senderName, setSenderName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUploadedSuccess, setProofUploadedSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      alert('Mohon lengkapi seluruh formulir data pengiriman.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingExpedition,
        paymentMethod,
        subtotal,
        shippingCost: shippingFee,
        discount,
        total: grandTotal,
        items: itemsToCheckout.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          productImage: (() => {
            try {
              return JSON.parse(i.product.images)[0];
            } catch {
              return i.product.images;
            }
          })(),
          size: i.size,
          quantity: i.quantity,
          price: i.product.price,
          subtotal: i.product.price * i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCreatedOrder(data.data);
        setSenderName(customerName);
        setStep('PAYMENT');
        clearCart();
        onOrderSuccess(data.data);

        // Confetti burst
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        alert(data.error || 'Gagal memproses pesanan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Proof of payment file simulator/handler
  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;
    if (!proofFileUrl) {
      alert('Silakan pilih/lampirkan foto bukti struk pembayaran transfer Anda.');
      return;
    }

    setIsUploadingProof(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.orderNumber}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofUrl: proofFileUrl,
          senderName,
          referenceNumber: referenceNumber || 'TRX-' + Math.floor(100000 + Math.random() * 900000),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProofUploadedSuccess(true);
        if (data.data) {
          setCreatedOrder(data.data);
        }
      } else {
        alert(data.error || 'Gagal mengirim bukti pembayaran.');
      }
    } catch (err: any) {
      alert(err.message || 'Koneksi gagal');
    } finally {
      setIsUploadingProof(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
      <div className="relative bg-white border-2 border-black max-w-3xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] my-6">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-black flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-mono font-black text-sm sm:text-base uppercase tracking-wider">
                {step === 'FORM' ? 'CHECKOUT INSTAN TUMBAS MAS' : `ORDER #${createdOrder?.orderNumber}`}
              </h2>
              <p className="text-[10px] font-mono text-neutral-400">
                {step === 'FORM' ? 'Isi data & pilih metode pembayaran digital' : 'Selesaikan pembayaran & unggah bukti'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM PENGIRIMAN & METODE BAYAR */}
        {step === 'FORM' && (
          <form onSubmit={handleProcessOrder} className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Data Pengiriman */}
              <div className="space-y-4">
                <div className="border-b border-black pb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase">
                  <Truck className="w-4 h-4" />
                  1. Data Penerima & Pengiriman
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      NAMA LENGKAP *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Kevin Sanjaya"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-black focus:ring-1 focus:ring-black outline-none bg-neutral-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-black outline-none bg-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        NO. WHATSAPP *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="081234567890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-black outline-none bg-neutral-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      ALAMAT LENGKAP *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-black outline-none bg-neutral-50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        KOTA / KABUPATEN
                      </label>
                      <input
                        type="text"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full px-3 py-2 border border-black outline-none bg-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        PILIHAN KURIR
                      </label>
                      <select
                        value={shippingExpedition}
                        onChange={(e) => setShippingExpedition(e.target.value)}
                        className="w-full px-3 py-2 border border-black outline-none bg-neutral-50"
                      >
                        <option value="JNE Reguler">JNE Reguler (1-2 Hari)</option>
                        <option value="J&T Express">J&T Express (1-3 Hari)</option>
                        <option value="SiCepat BEST">SiCepat BEST (Next Day)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Pilihan Pembayaran & Ringkasan */}
              <div className="space-y-4">
                <div className="border-b border-black pb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase">
                  <CreditCard className="w-4 h-4" />
                  2. Metode Pembayaran Digital
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {[
                    {
                      id: 'QRIS_INSTANT',
                      name: 'QRIS INSTANT (Semua E-Wallet & Bank)',
                      desc: 'Scan QR otomatis via BCA, Mandiri, GoPay, OVO, ShopeePay',
                      badge: 'TERPOPULER',
                    },
                    {
                      id: 'BCA_TRANSFER',
                      name: 'TRANSFER BANK BCA (Manual / M-BCA)',
                      desc: 'Rekening: 5271-992-811 a.n PT TUMBAS MAS INDONESIA',
                      badge: 'VERIFIKASI CEPAT',
                    },
                    {
                      id: 'MANDIRI_TRANSFER',
                      name: 'TRANSFER BANK MANDIRI (Livin)',
                      desc: 'Rekening: 137-00-8819-2026 a.n PT TUMBAS MAS INDONESIA',
                      badge: '24 JAM',
                    },
                    {
                      id: 'GOPAY',
                      name: 'GOPAY DIGITAL TRANSFER',
                      desc: 'Nomor: 0812-8899-1811 a.n TUMBAS MAS OFFICIAL',
                      badge: 'INSTAN',
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`block p-3 border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-black bg-neutral-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-neutral-300 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id as any)}
                            className="accent-black"
                          />
                          <span className="font-bold text-[11px]">{method.name}</span>
                        </div>
                        <span className="text-[9px] bg-black text-white px-1.5 py-0.5 font-bold">
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 pl-5">
                        {method.desc}
                      </p>
                    </label>
                  ))}
                </div>

                {/* Ringkasan Ringkas */}
                <div className="p-3 border border-black bg-neutral-50 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Item ({itemsToCheckout.length}):</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Diskon Promo:</span>
                      <span>-{formatRupiah(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Ongkir ({shippingExpedition}):</span>
                    <span>{shippingFee === 0 ? 'GRATIS' : formatRupiah(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-2 border-t border-black text-black">
                    <span>TOTAL HARGA:</span>
                    <span>{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black text-white font-mono font-black text-xs uppercase tracking-widest hover:bg-neutral-800 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>MEMPROSES PESANAN KE DATABASE...</span>
                ) : (
                  <>
                    <span>BUAT PESANAN & BAYAR ({formatRupiah(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: INSTRUKSI PEMBAYARAN DIGITAL & UPLOAD BUKTI */}
        {step === 'PAYMENT' && createdOrder && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Status Alert Banner */}
            <div className="p-4 border-2 border-black bg-neutral-50 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-black shrink-0" />
              <div>
                <div className="font-mono font-black text-sm uppercase">
                  PESANAN #{createdOrder.orderNumber} TELAH DICATAT!
                </div>
                <div className="font-mono text-xs text-neutral-600 mt-0.5">
                  Tersimpan di database PostgreSQL. Silakan selesaikan pembayaran sejumlah{' '}
                  <strong className="text-black">{formatRupiah(createdOrder.total)}</strong>.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Metode Bayar Terpilih */}
              <div className="space-y-4">
                <div className="border-b border-black pb-2 font-mono text-xs font-bold uppercase">
                  INSTRUKSI PEMBAYARAN
                </div>

                {createdOrder.paymentMethod === 'QRIS_INSTANT' && (
                  <div className="border-2 border-black p-4 text-center bg-white space-y-3">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-black text-white px-2 py-0.5">
                      <QrCode className="w-3.5 h-3.5" />
                      QRIS DINAMIS TUMBAS MAS
                    </div>

                    {/* Realistic SVG QRIS Graphic */}
                    <div className="mx-auto w-48 h-48 border-2 border-black p-2 bg-white flex flex-col items-center justify-center relative">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226610014ID.GO.IDN.QRIS01189360091800000000020215TUMBASMASID0303UME52045999530336054066490005802ID5910TUMBAS MAS6007JAKARTA62070703A016304"
                        alt="QRIS Code Tumbas Mas"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <p className="text-[11px] font-mono text-neutral-600">
                      Buka aplikasi BCA / Mandiri / GoPay / OVO, lalu scan kode QR di atas.
                    </p>
                  </div>
                )}

                {createdOrder.paymentMethod === 'BCA_TRANSFER' && (
                  <div className="border-2 border-black p-4 bg-white space-y-3 font-mono text-xs">
                    <div className="font-bold text-sm">BANK CENTRAL ASIA (BCA)</div>
                    <div className="p-3 bg-neutral-100 border border-neutral-300">
                      <div className="text-neutral-500 text-[10px]">NOMOR REKENING:</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base font-black tracking-wider">5271-992-811</span>
                        <button
                          onClick={() => handleCopy('5271992811', 'bca')}
                          className="px-2 py-1 bg-black text-white text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === 'bca' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'bca' ? 'Disalin' : 'Salin'}
                        </button>
                      </div>
                      <div className="text-neutral-600 text-[11px] mt-1">
                        a.n PT TUMBAS MAS INDONESIA
                      </div>
                    </div>
                  </div>
                )}

                {createdOrder.paymentMethod === 'MANDIRI_TRANSFER' && (
                  <div className="border-2 border-black p-4 bg-white space-y-3 font-mono text-xs">
                    <div className="font-bold text-sm">BANK MANDIRI (LIVIN)</div>
                    <div className="p-3 bg-neutral-100 border border-neutral-300">
                      <div className="text-neutral-500 text-[10px]">NOMOR REKENING:</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base font-black tracking-wider">137-00-8819-2026</span>
                        <button
                          onClick={() => handleCopy('1370088192026', 'mandiri')}
                          className="px-2 py-1 bg-black text-white text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === 'mandiri' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'mandiri' ? 'Disalin' : 'Salin'}
                        </button>
                      </div>
                      <div className="text-neutral-600 text-[11px] mt-1">
                        a.n PT TUMBAS MAS INDONESIA
                      </div>
                    </div>
                  </div>
                )}

                {createdOrder.paymentMethod === 'GOPAY' && (
                  <div className="border-2 border-black p-4 bg-white space-y-3 font-mono text-xs">
                    <div className="font-bold text-sm">GOPAY DIGITAL TRANSFER</div>
                    <div className="p-3 bg-neutral-100 border border-neutral-300">
                      <div className="text-neutral-500 text-[10px]">NOMOR HP GOPAY:</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-base font-black tracking-wider">0812-8899-1811</span>
                        <button
                          onClick={() => handleCopy('081288991811', 'gopay')}
                          className="px-2 py-1 bg-black text-white text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === 'gopay' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'gopay' ? 'Disalin' : 'Salin'}
                        </button>
                      </div>
                      <div className="text-neutral-600 text-[11px] mt-1">
                        a.n TUMBAS MAS OFFICIAL
                      </div>
                    </div>
                  </div>
                )}

                {/* Nominal Yang Harus Ditransfer */}
                <div className="p-3 border border-black bg-neutral-50 font-mono text-xs flex justify-between items-center">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">JUMLAH HARUS DITRANSFER:</span>
                    <span className="text-base font-black text-black">
                      {formatRupiah(createdOrder.total)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(String(createdOrder.total), 'total')}
                    className="px-2 py-1 border border-black text-[10px] font-bold hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedText === 'total' ? 'Disalin!' : 'Salin Jumlah'}
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Upload Bukti Pembayaran */}
              <div className="space-y-4">
                <div className="border-b border-black pb-2 font-mono text-xs font-bold uppercase">
                  UNGGAH BUKTI PEMBAYARAN
                </div>

                {proofUploadedSuccess ? (
                  <div className="p-5 border-2 border-black bg-emerald-50 text-emerald-950 font-mono text-xs space-y-3">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      BUKTI BERHASIL DIKIRIM!
                    </div>
                    <p className="leading-relaxed">
                      Bukti struk transfer Anda telah masuk ke antrean approval Admin Toko. Status pesanan
                      akan diperbarui menjadi <strong>LUNAS</strong> dan langsung diproses setelah verifikasi.
                    </p>
                    <div className="pt-2 border-t border-emerald-300">
                      <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase hover:bg-neutral-800 cursor-pointer"
                      >
                        Tutup & Selesai
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProof} className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        NAMA REKENING PENGIRIM
                      </label>
                      <input
                        type="text"
                        placeholder="cth: RIZKY PRATAMA"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3 py-2 border border-black outline-none bg-neutral-50 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        NOMOR REFERENSI / CATATAN TRANSFER
                      </label>
                      <input
                        type="text"
                        placeholder="cth: TRX-BCA-9817263 (opsional)"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-black outline-none bg-neutral-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        FOTO STRUK / SCREENSHOT TRANSFER *
                      </label>
                      <div className="border-2 border-dashed border-black p-4 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          required={!proofFileUrl}
                          onChange={handleProofImageChange}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        {proofFileUrl ? (
                          <div className="space-y-2">
                            <img
                              src={proofFileUrl}
                              alt="Bukti Transfer Preview"
                              className="max-h-36 mx-auto border border-black object-contain"
                            />
                            <p className="text-[10px] text-emerald-700 font-bold">
                              ✓ Bukti telah dipilih. Klik kirim di bawah.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-6 h-6 mx-auto text-black" />
                            <p className="font-bold text-xs">PILIH FOTO ATAU DRAG DISINI</p>
                            <p className="text-[10px] text-neutral-500">
                              Format JPG, PNG, atau Screenshot Mobile Banking
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pre-fill Sample Slip button for quick demo testing */}
                    {!proofFileUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setProofFileUrl(
                            'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop'
                          )
                        }
                        className="text-[10px] text-neutral-500 hover:text-black underline cursor-pointer"
                      >
                        [Gunakan contoh slip bukti transfer untuk demo]
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isUploadingProof || !proofFileUrl}
                      className="w-full py-3 bg-black text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-40 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                    >
                      {isUploadingProof ? 'MENGUNGGAH BUKTI...' : 'KIRIM BUKTI PEMBAYARAN SEKARANG'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-black flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-500">
                Lacak status kapan saja menggunakan Nomor Order #{createdOrder.orderNumber}
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 border border-black hover:bg-neutral-100 font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
