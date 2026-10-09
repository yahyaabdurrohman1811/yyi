export interface Product {
  id: number;
  name: string;
  slug: string;
  category: 'kaos-boxy' | 'zipper-hoodie' | 'celana-jeans';
  price: number;
  originalPrice?: number | null;
  stock: number;
  sizes: string; // e.g. "S,M,L,XL,XXL" or "28,30,32,34,36"
  description: string;
  material: string;
  gsm: string;
  fit: string;
  images: string; // JSON array of string URLs
  isFeatured?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingExpedition: string;
  paymentMethod: string;
  paymentStatus: 'MENUNGGU_PEMBAYARAN' | 'MENUNGGU_APPROVAL' | 'LUNAS' | 'DITOLAK';
  orderStatus: 'MENUNGGU_KONFIRMASI' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI' | 'DIBATALKAN';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentProofUrl?: string | null;
  paymentProofSender?: string | null;
  paymentProofRef?: string | null;
  paymentProofUploadedAt?: string | null;
  trackingNumber?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface Customer {
  id: number;
  uid?: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string | null;
  postalCode?: string | null;
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
}

export interface DashboardAnalytics {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingApprovalCount: number;
  totalProducts: number;
  totalCustomers: number;
  paymentDistribution: Record<string, number>;
  lowStockProducts: Product[];
}
