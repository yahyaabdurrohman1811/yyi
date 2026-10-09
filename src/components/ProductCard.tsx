import React, { useState } from 'react';
import { Product } from '../types.ts';
import { formatRupiah } from '../utils/format.ts';
import { useCart } from '../context/CartContext.tsx';
import { Plus, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail }) => {
  const { addToCart } = useCart();
  const availableSizes = product.sizes.split(',').map((s) => s.trim());
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);

  // Parse images
  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [product.images];
  }
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000';
  const hoverImage = images[1] || mainImage;

  const isLowStock = product.stock > 0 && product.stock <= 25;
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedSize, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onViewDetail(product)}
      className="group relative border border-black bg-white flex flex-col justify-between transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 border-b border-black">
        {/* Main Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider uppercase">
            {product.gsm}
          </span>
          {isOutOfStock ? (
            <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider">
              HABIS
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-400 text-black text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider">
              SISA {product.stock} PCS
            </span>
          ) : null}
        </div>

        {/* Quick View Floating Action */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(product);
            }}
            className="w-full bg-white text-black py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-neutral-100 shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            Detail & Size Chart
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Fit info */}
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
            <span>
              {product.category === 'kaos-boxy'
                ? 'KAOS BOXY'
                : product.category === 'zipper-hoodie'
                ? 'ZIPPER HOODIE'
                : 'CELANA JEANS'}
            </span>
            <span className="font-bold text-neutral-800">{product.fit}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold tracking-tight text-black uppercase font-mono line-clamp-2 leading-snug group-hover:underline">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-extrabold font-mono text-black">
              {formatRupiah(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs font-mono text-neutral-400 line-through">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Size Selection & Quick Add */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] font-mono text-neutral-500">PILIH UKURAN:</span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border cursor-pointer ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 text-neutral-700 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider border border-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {isOutOfStock ? (
              'STOK KOSONG'
            ) : isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                DITAMBAHKAN ({selectedSize})
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                + BAG ({selectedSize})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
