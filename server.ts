import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getProducts,
  getProductByIdOrSlug,
  updateProduct,
  createProduct,
  deleteProduct,
  getOrders,
  getOrderByNumber,
  createOrder,
  uploadPaymentProof,
  approvePaymentProof,
  rejectPaymentProof,
  updateOrderStatus,
  getCustomers,
  getDashboardAnalytics,
} from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    database: 'PostgreSQL (Cloud SQL)',
    store: 'Tumbas Mas',
    timestamp: new Date().toISOString(),
  });
});

// Admin Auth Login
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { password } = req.body;
  // Default store admin password: 'admin' or 'tumbasmas2026'
  if (password === 'admin' || password === 'tumbasmas2026' || password === 'admin123') {
    return res.json({
      success: true,
      token: 'admin-tumbas-master-key',
      user: {
        name: 'Head Administrator',
        email: 'admin@tumbasmas.com',
        role: 'superadmin',
      },
    });
  }
  return res.status(401).json({ success: false, error: 'Password admin tidak valid.' });
});

// Products API
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search, sort } = req.query;
    const productsList = await getProducts({
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      sortBy: sort ? String(sort) : undefined,
    });
    res.json({ success: true, data: productsList });
  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mengambil data produk' });
  }
});

app.get('/api/products/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const product = await getProductByIdOrSlug(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Error in GET /api/products/:idOrSlug:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mengambil detail produk' });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const created = await createProduct(productData);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menambahkan produk' });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateProduct(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error in PUT /api/products/:id:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal memperbarui produk' });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteProduct(id);
    res.json({ success: true, data: deleted });
  } catch (error: any) {
    console.error('Error in DELETE /api/products/:id:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menghapus produk' });
  }
});

// Orders API
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const ordersList = await getOrders(status);
    res.json({ success: true, data: ordersList });
  } catch (error: any) {
    console.error('Error in GET /api/orders:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mengambil daftar pesanan' });
  }
});

app.get('/api/orders/:orderNumber', async (req: Request, res: Response) => {
  try {
    const order = await getOrderByNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error in GET /api/orders/:orderNumber:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal melacak pesanan' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData.items || !orderData.items.length) {
      return res.status(400).json({ success: false, error: 'Keranjang belanja kosong' });
    }
    const order = await createOrder(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal membuat pesanan' });
  }
});

app.post('/api/orders/:orderNumber/payment-proof', async (req: Request, res: Response) => {
  try {
    const { proofUrl, senderName, referenceNumber } = req.body;
    if (!proofUrl) {
      return res.status(400).json({ success: false, error: 'Bukti transfer wajib dilampirkan' });
    }
    const order = await uploadPaymentProof(req.params.orderNumber, {
      proofUrl,
      senderName,
      referenceNumber,
    });
    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error in payment proof upload:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mengunggah bukti pembayaran' });
  }
});

app.post('/api/orders/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const order = await approvePaymentProof(id);
    res.json({ success: true, data: order, message: 'Pembayaran disetujui' });
  } catch (error: any) {
    console.error('Error approving payment:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menyetujui pembayaran' });
  }
});

app.post('/api/orders/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const order = await rejectPaymentProof(id, reason || 'Bukti transfer tidak valid/tidak sesuai');
    res.json({ success: true, data: order, message: 'Pembayaran ditolak' });
  } catch (error: any) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menolak pembayaran' });
  }
});

app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, trackingNumber } = req.body;
    const order = await updateOrderStatus(id, status, trackingNumber);
    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal memperbarui status order' });
  }
});

// Customers API
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const customersList = await getCustomers();
    res.json({ success: true, data: customersList });
  } catch (error: any) {
    console.error('Error in GET /api/customers:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mengambil data pelanggan' });
  }
});

// Analytics & Dashboard API
app.get('/api/analytics/dashboard', async (req: Request, res: Response) => {
  try {
    const analytics = await getDashboardAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Error in GET /api/analytics/dashboard:', error);
    res.status(500).json({ success: false, error: error.message || 'Gagal mengambil analitik penjualan' });
  }
});

// Vite Middleware for SPA Frontend
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tumbas Mas server running on http://0.0.0.0:${PORT}`);
  });
});
