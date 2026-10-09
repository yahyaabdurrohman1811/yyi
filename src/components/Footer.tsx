import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenTrackOrder,
  onOpenAdmin,
}) => {
  return (
    <footer className="border-t-2 border-black bg-black text-white font-mono">
      {/* 4 Guarantees */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-neutral-400 shrink-0" />
          <div>
            <div className="font-bold">PENGIRIMAN EKSPRES</div>
            <div className="text-[10px] text-neutral-400">JNE, J&T, SiCepat Next Day</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-neutral-400 shrink-0" />
          <div>
            <div className="font-bold">100% ORIGINAL HEAVY</div>
            <div className="text-[10px] text-neutral-400">Cotton 280-480 GSM & Selvedge</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-neutral-400 shrink-0" />
          <div>
            <div className="font-bold">GARANSI TUKAR SIZE</div>
            <div className="text-[10px] text-neutral-400">3 hari sejak paket diterima</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-neutral-400 shrink-0" />
          <div>
            <div className="font-bold">DATABASE POSTGRESQL</div>
            <div className="text-[10px] text-neutral-400">Single Source of Truth</div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-black text-2xl tracking-tighter">TUMBAS MAS</span>
            <span className="text-[10px] border border-white px-1.5 py-0.2">EDITION 2026</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-sm">
            Webstore marketplace streetwear esensial terinspirasi estetika brutalist Calle de Larache.
            Fokus pada siluet boxy bervolume kaku, gramasi katun heavyweight tahan lama, dan potongan celana denim berkarakter.
          </p>
          <div className="pt-2 text-[10px] text-neutral-500">
            JAKARTA ATELIER • KONEKSI POSTGRESQL AKTIF
          </div>
        </div>

        <div className="md:col-span-3 space-y-2 text-xs">
          <div className="font-bold text-neutral-300 uppercase tracking-widest text-[11px] mb-3">
            KATALOG PRODUK
          </div>
          <ul className="space-y-2 text-neutral-400">
            <li>
              <button
                onClick={() => onSelectCategory('kaos-boxy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Kaos Boxy (280-310 GSM)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('zipper-hoodie')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Zipper Hoodie (480 GSM)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('celana-jeans')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Celana Jeans (14.5 OZ)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('all')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Semua Koleksi (12 Produk)
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-2 text-xs">
          <div className="font-bold text-neutral-300 uppercase tracking-widest text-[11px] mb-3">
            LAYANAN & SISTEM
          </div>
          <ul className="space-y-2 text-neutral-400">
            <li>
              <button
                onClick={onOpenTrackOrder}
                className="hover:text-white transition-colors cursor-pointer underline underline-offset-4"
              >
                Lacak Status Pesanan & Upload Slip
              </button>
            </li>
            <li>
              <button
                onClick={onOpenAdmin}
                className="hover:text-white transition-colors cursor-pointer underline underline-offset-4"
              >
                Portal Admin & Approval Pembayaran
              </button>
            </li>
            <li className="text-neutral-500 pt-2 text-[11px]">
              Pembayaran: QRIS Instant, BCA, Mandiri Livin, GoPay
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-800 py-6 text-center text-[10px] text-neutral-500">
        © 2026 TUMBAS MAS STREETWEAR MARKETPLACE. ALL RIGHTS RESERVED. INSPIRASI DESAIN CALLE DE LARACHE.
      </div>
    </footer>
  );
};
