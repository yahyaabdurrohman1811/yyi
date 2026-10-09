import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types.ts';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  promoCode: string;
  discount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  subtotal: number;
  shippingFee: number;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tumbas_mas_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [freeShipping, setFreeShipping] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('tumbas_mas_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Cart storage error:', e);
    }
  }, [items]);

  const addToCart = (product: Product, size: string, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.size === size
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(product.stock, next[existingIndex].quantity + quantity);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
        };
        return next;
      } else {
        return [...prev, { product, size, quantity: Math.min(product.stock, quantity) }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQuantity = (productId: number, size: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(item.product.stock, nextQty),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setFreeShipping(false);
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'TUMBAS10' || clean === 'LARACHE10') {
      setPromoCode(clean);
      setDiscountPercent(10);
      setFreeShipping(false);
      return { success: true, message: 'Kode promo 10% OFF berhasil dipasang!' };
    } else if (clean === 'MASBEBASONGKIR' || clean === 'FREESHIP') {
      setPromoCode(clean);
      setDiscountPercent(0);
      setFreeShipping(true);
      return { success: true, message: 'Bebas ongkos kirim berhasil diaktifkan!' };
    }
    return { success: false, message: 'Kode promo tidak valid atau telah kadaluarsa.' };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
    setFreeShipping(false);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const baseShipping = items.length > 0 ? (freeShipping ? 0 : 20000) : 0;
  const total = Math.max(0, subtotal - discount + baseShipping);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        promoCode,
        discount,
        applyPromoCode,
        removePromoCode,
        subtotal,
        shippingFee: baseShipping,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
