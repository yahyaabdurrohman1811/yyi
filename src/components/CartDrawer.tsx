import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { formatRupiah } from '../utils/format.ts';
import { X, Trash2, ArrowRight, Tag, Check, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onStartCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onStartCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    discount,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, success: res.success });
    if (res.success) {
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-black flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-black flex items-center justify-between bg-black text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <h2 className="font-mono font-bold text-sm uppercase tracking-wider">
                BAG ARCHIVE ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 border-2 border-black flex items-center justify-center bg-neutral-50">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-mono font-bold text-base uppercase">Keranjang Masih Kosong</h3>
                <p className="text-xs text-neutral-500 max-w-xs font-sans">
                  Pilih produk favorit Anda dari katalog streetwear Tumbas Mas (Kaos Boxy, Zipper Hoodie, Celana Jeans).
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 border-2 border-black bg-black text-white font-mono text-xs font-bold uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              items.map((item) => {
                let images: string[] = [];
                try {
                  images = JSON.parse(item.product.images);
                } catch {
                  images = [item.product.images];
                }
                const img = images[0] || '';

                return (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-3 p-3 border border-black bg-neutral-50 hover:bg-white transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 border border-black bg-white shrink-0 overflow-hidden">
                      <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-mono font-bold text-xs uppercase line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
                            title="Hapus item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-white font-bold">
                            SIZE: {item.size}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {item.product.gsm}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-black bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, -1)}
                            className="px-2 py-0.5 text-xs font-mono hover:bg-neutral-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-mono font-bold border-x border-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-0.5 text-xs font-mono hover:bg-neutral-100 cursor-pointer disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-mono font-black text-xs">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t-2 border-black bg-white space-y-3">
              {/* Promo Code Input */}
              <div>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-neutral-100 border border-black p-2 text-xs font-mono">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      KODE: {promoCode} AKTIF
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Kode Promo (cth: TUMBAS10 / MASBEBASONGKIR)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-black text-xs font-mono uppercase outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-black text-white text-xs font-mono font-bold hover:bg-neutral-800 cursor-pointer"
                    >
                      KLAIM
                    </button>
                  </form>
                )}
                {promoMessage && (
                  <p
                    className={`text-[11px] font-mono mt-1 ${
                      promoMessage.success ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 font-mono text-xs pt-1 border-t border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Diskon Promo:</span>
                    <span>-{formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Ongkir Standar (JNE/J&T):</span>
                  <span>{shippingFee === 0 ? 'GRATIS (PROMO)' : formatRupiah(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-black text-black">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onStartCheckout();
                }}
                className="w-full py-3.5 bg-black text-white hover:bg-neutral-800 font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <span>CHECKOUT INSTAN ({items.length} ITEM)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-[10px] font-mono text-neutral-400 hover:text-black cursor-pointer pt-1"
              >
                Kosongkan Keranjang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
