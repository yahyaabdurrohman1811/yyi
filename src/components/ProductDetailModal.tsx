import React, { useState } from 'react';
import { Product } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import { useCart } from '../context/CartContext.tsx';
import { X, Check, ShieldCheck, Ruler, ArrowRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectCheckout: (product: Product, size: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const availableSizes = product.sizes.split(',').map((s) => s.trim());
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [product.images];
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  const handleFastBuy = () => {
    onDirectCheckout(product, selectedSize, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
      <div className="relative bg-white border-2 border-black max-w-4xl w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] my-8">
        {/* Header Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 border border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-black flex flex-col justify-between bg-neutral-50">
            {/* Main Preview Image */}
            <div className="aspect-4/5 overflow-hidden border border-black bg-white relative">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-mono px-2 py-0.5 font-bold">
                {product.gsm} // {product.fit}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 border-2 shrink-0 overflow-hidden cursor-pointer ${
                      selectedImageIndex === idx ? 'border-black' : 'border-neutral-300 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Streetwear Authenticity Stamp */}
            <div className="mt-4 pt-3 border-t border-neutral-300 flex items-center justify-between text-[11px] font-mono text-neutral-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-black" />
                Original Archive Spec
              </span>
              <span>STOK: {product.stock} PCS</span>
            </div>
          </div>

          {/* Details & Actions Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-500">
                  {product.category.replace('-', ' ')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-black uppercase mt-1">
                  {product.name}
                </h2>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-black font-mono text-black">
                    {formatRupiah(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-mono text-neutral-400 line-through">
                      {formatRupiah(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-b border-neutral-200 py-3 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
                {product.description}
              </div>

              {/* Technical Fabric Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-100 p-3 border border-neutral-300">
                <div>
                  <span className="text-neutral-500 block text-[10px]">MATERIAL:</span>
                  <span className="font-bold text-black">{product.material}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">GRAMASI / WEIGHT:</span>
                  <span className="font-bold text-black">{product.gsm}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">SILUET POTONGAN:</span>
                  <span className="font-bold text-black">{product.fit}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">KONDISI:</span>
                  <span className="font-bold text-black">Brand New (BNWT)</span>
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-black">PILIH UKURAN:</span>
                  <button
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="text-[11px] font-mono text-neutral-600 hover:text-black flex items-center gap-1 underline cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    {showSizeChart ? 'Tutup Size Chart' : 'Panduan Ukuran (Size Chart)'}
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs font-mono font-bold border cursor-pointer transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-black bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Chart Drawer Inline */}
                {showSizeChart && (
                  <div className="mt-3 p-3 border border-black bg-neutral-50 text-[10px] font-mono">
                    <p className="font-bold mb-1">PANDUAN UKURAN (CENTIMETER):</p>
                    {product.category === 'celana-jeans' ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black">
                            <th className="py-1">SIZE</th>
                            <th>PINGGANG</th>
                            <th>PANJANG</th>
                            <th>OPENING</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>28</td><td>76 cm</td><td>104 cm</td><td>24 cm</td></tr>
                          <tr><td>30</td><td>80 cm</td><td>106 cm</td><td>25 cm</td></tr>
                          <tr><td>32</td><td>86 cm</td><td>108 cm</td><td>26 cm</td></tr>
                          <tr><td>34</td><td>90 cm</td><td>110 cm</td><td>27 cm</td></tr>
                          <tr><td>36</td><td>96 cm</td><td>112 cm</td><td>28 cm</td></tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black">
                            <th className="py-1">SIZE</th>
                            <th>LEBAR DADA</th>
                            <th>PANJANG</th>
                            <th>BAHU</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>S</td><td>56 cm</td><td>68 cm</td><td>53 cm</td></tr>
                          <tr><td>M</td><td>60 cm</td><td>71 cm</td><td>56 cm</td></tr>
                          <tr><td>L</td><td>64 cm</td><td>74 cm</td><td>59 cm</td></tr>
                          <tr><td>XL</td><td>68 cm</td><td>77 cm</td><td>62 cm</td></tr>
                          <tr><td>XXL</td><td>72 cm</td><td>80 cm</td><td>65 cm</td></tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold">JUMLAH:</span>
                <div className="flex items-center border border-black">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 font-mono text-sm hover:bg-neutral-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-mono text-sm font-bold border-x border-black">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 font-mono text-sm hover:bg-neutral-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-black space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3 border-2 border-black bg-white text-black hover:bg-neutral-100 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    BERHASIL DITAMBAHKAN
                  </>
                ) : (
                  <>+ TAMBAH KE KERANJANG BELANJA</>
                )}
              </button>

              <button
                onClick={handleFastBuy}
                disabled={product.stock <= 0}
                className="w-full py-3.5 bg-black text-white hover:bg-neutral-800 font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>BELI SEKARANG (INSTANT CHECKOUT)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
