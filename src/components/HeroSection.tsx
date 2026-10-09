import React from 'react';
import { ArrowDownRight, Layers, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onSelectCategory: (cat: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectCategory }) => {
  return (
    <section className="border-b border-black bg-white">
      {/* Top Banner Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Headline */}
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 border border-black px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest bg-neutral-50">
              <span className="w-2 h-2 bg-black"></span>
              Koleksi Eksklusif FW26 // Ready Stock JKT
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-black uppercase leading-none font-mono">
              STREETWEAR ARCHIVE
              <br />
              <span className="bg-black text-white px-2 py-0.5 inline-block mt-1">
                TUMBAS MAS
              </span>
            </h1>

            <p className="text-neutral-700 text-sm sm:text-base max-w-2xl leading-relaxed font-sans">
              Terinspirasi estetika brutalist luxury <strong>Calle de Larache</strong>. Kami
              menghadirkan 12 rilisan siluet esensial: kaos boxy berbobot kaku 280 GSM, zipper hoodie
              heavy French Terry 480 GSM dengan gunmetal double-zip, dan baggy raw selvedge jeans 14.5 oz.
            </p>

            {/* Quick Filter CTAs */}
            <div className="flex flex-wrap gap-2 pt-2 font-mono text-xs font-bold">
              <button
                onClick={() => onSelectCategory('kaos-boxy')}
                className="px-4 py-2.5 border border-black bg-white hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>KAOS BOXY (280-310 GSM)</span>
                <ArrowDownRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectCategory('zipper-hoodie')}
                className="px-4 py-2.5 border border-black bg-white hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>ZIPPER HOODIE (480 GSM)</span>
                <ArrowDownRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectCategory('celana-jeans')}
                className="px-4 py-2.5 border border-black bg-white hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>CELANA JEANS (14.5 OZ)</span>
                <ArrowDownRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Technical Spec Lookbook Card */}
          <div className="lg:col-span-4 border-2 border-black p-5 bg-neutral-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b border-black pb-3">
              <span className="font-mono text-xs font-black tracking-widest">
                SPECIFICATION SHEET
              </span>
              <span className="font-mono text-[10px] bg-black text-white px-1.5 py-0.5">
                VERIFIED
              </span>
            </div>

            <div className="py-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-500">DATABASE:</span>
                <span className="font-bold">PostgreSQL Relational</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-500">FIT SILHOUETTE:</span>
                <span className="font-bold">Boxy / Drop-Shoulder</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-500">HARDWARE:</span>
                <span className="font-bold">YKK 2-Way Gunmetal Zipper</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span className="text-neutral-500">PEMBAYARAN:</span>
                <span className="font-bold text-emerald-700">QRIS, BCA, Mandiri, GoPay</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">APPROVAL SPEED:</span>
                <span className="font-bold text-black">&lt; 5 Menit via Admin</span>
              </div>
            </div>

            {/* Barcode Graphic */}
            <div className="pt-2 border-t border-black text-center">
              <div className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 mb-1">
                |||| | |||||| || ||||| ||||||| |||| | ||||||
              </div>
              <div className="font-mono text-[9px] text-neutral-400">
                TUMBAS-MAS-ID-2026-ARCHIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars Footer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-black font-mono text-xs">
        <div className="p-4 border-b md:border-b-0 md:border-r border-black flex items-center gap-3 bg-white">
          <Layers className="w-5 h-5 text-black shrink-0" />
          <div>
            <div className="font-bold">100% HEAVYWEIGHT CUSTOM KNIT</div>
            <div className="text-[11px] text-neutral-500">Kain tebal kaku tidak mudah melar dicuci berkali-kali</div>
          </div>
        </div>

        <div className="p-4 border-b md:border-b-0 md:border-r border-black flex items-center gap-3 bg-neutral-50">
          <Zap className="w-5 h-5 text-black shrink-0" />
          <div>
            <div className="font-bold">INSTANT FAST CHECKOUT</div>
            <div className="text-[11px] text-neutral-500">QRIS dinamis langsung bayar dan verifikasi instan</div>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3 bg-white">
          <ShieldCheck className="w-5 h-5 text-black shrink-0" />
          <div>
            <div className="font-bold">REAL DATABASE POSTGRESQL</div>
            <div className="text-[11px] text-neutral-500">Sinkronisasi stok & riwayat pesanan real-time</div>
          </div>
        </div>
      </div>
    </section>
  );
};
