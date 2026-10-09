import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // 'kaos-boxy', 'zipper-hoodie', 'celana-jeans'
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  stock: integer('stock').notNull().default(25),
  sizes: text('sizes').notNull().default('S,M,L,XL,XXL'),
  description: text('description').notNull(),
  material: text('material').notNull(),
  gsm: text('gsm').notNull(),
  fit: text('fit').notNull(),
  images: text('images').notNull(), // JSON string array
  isFeatured: boolean('is_featured').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customers Table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').default('Jakarta'),
  postalCode: text('postal_code').default('10110'),
  totalSpent: integer('total_spent').default(0),
  ordersCount: integer('orders_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: integer('customer_id'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  shippingCity: text('shipping_city').notNull(),
  shippingExpedition: text('shipping_expedition').notNull().default('JNE Reguler'),
  paymentMethod: text('payment_method').notNull(), // 'QRIS_INSTANT', 'BCA_TRANSFER', 'MANDIRI_TRANSFER', 'GOPAY'
  paymentStatus: text('payment_status').notNull().default('MENUNGGU_PEMBAYARAN'), // 'MENUNGGU_PEMBAYARAN', 'MENUNGGU_APPROVAL', 'LUNAS', 'DITOLAK'
  orderStatus: text('order_status').notNull().default('MENUNGGU_KONFIRMASI'), // 'MENUNGGU_KONFIRMASI', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'
  subtotal: integer('subtotal').notNull(),
  shippingCost: integer('shipping_cost').notNull().default(20000),
  discount: integer('discount').notNull().default(0),
  total: integer('total').notNull(),
  paymentProofUrl: text('payment_proof_url'),
  paymentProofSender: text('payment_proof_sender'),
  paymentProofRef: text('payment_proof_ref'),
  paymentProofUploadedAt: timestamp('payment_proof_uploaded_at'),
  trackingNumber: text('tracking_number'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order Items Table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  productName: text('product_name').notNull(),
  productImage: text('product_image').notNull(),
  size: text('size').notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
  subtotal: integer('subtotal').notNull(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
