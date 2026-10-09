import { eq, desc, asc, sql, ilike, or } from 'drizzle-orm';
import { db } from './index.ts';
import { products, customers, orders, orderItems } from './schema.ts';

// Get products with filters
export async function getProducts(options?: {
  category?: string;
  search?: string;
  sortBy?: string;
}) {
  try {
    let query = db.select().from(products);
    const conditions = [];

    if (options?.category && options.category !== 'all') {
      conditions.push(eq(products.category, options.category));
    }

    if (options?.search) {
      const term = `%${options.search}%`;
      conditions.push(
        or(
          ilike(products.name, term),
          ilike(products.description, term),
          ilike(products.material, term)
        )
      );
    }

    let finalQuery: any = query;
    if (conditions.length === 1) {
      finalQuery = query.where(conditions[0]);
    } else if (conditions.length > 1) {
      finalQuery = query.where(sql`${conditions[0]} AND ${conditions[1]}`);
    }

    if (options?.sortBy === 'price_asc') {
      finalQuery = finalQuery.orderBy(asc(products.price));
    } else if (options?.sortBy === 'price_desc') {
      finalQuery = finalQuery.orderBy(desc(products.price));
    } else {
      finalQuery = finalQuery.orderBy(desc(products.id));
    }

    return await finalQuery;
  } catch (error) {
    console.error('Failed to get products:', error);
    throw new Error('Failed to fetch products from database.', { cause: error });
  }
}

// Get single product by id or slug
export async function getProductByIdOrSlug(idOrSlug: string | number) {
  try {
    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      const res = await db.select().from(products).where(eq(products.id, Number(idOrSlug)));
      return res[0] || null;
    }
    const res = await db.select().from(products).where(eq(products.slug, String(idOrSlug)));
    return res[0] || null;
  } catch (error) {
    console.error('Failed to get product:', error);
    throw new Error('Failed to fetch product details.', { cause: error });
  }
}

// Admin: Update product
export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  try {
    const res = await db.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Failed to update product:', error);
    throw new Error('Failed to update product.', { cause: error });
  }
}

// Admin: Create product
export async function createProduct(data: typeof products.$inferInsert) {
  try {
    const res = await db.insert(products).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to create product:', error);
    throw new Error('Failed to create product.', { cause: error });
  }
}

// Admin: Delete product
export async function deleteProduct(id: number) {
  try {
    const res = await db.delete(products).where(eq(products.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw new Error('Failed to delete product.', { cause: error });
  }
}

// Get all orders with their items
export async function getOrders(statusFilter?: string) {
  try {
    let baseQuery = db.select().from(orders).orderBy(desc(orders.createdAt));
    const allOrders = statusFilter && statusFilter !== 'ALL'
      ? await baseQuery.where(eq(orders.orderStatus, statusFilter))
      : await baseQuery;

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return {
          ...order,
          items,
        };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw new Error('Failed to fetch orders from database.', { cause: error });
  }
}

// Get single order by order number
export async function getOrderByNumber(orderNumber: string) {
  try {
    const res = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    if (!res.length) return null;
    const order = res[0];
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return { ...order, items };
  } catch (error) {
    console.error('Failed to get order:', error);
    throw new Error('Failed to fetch order details.', { cause: error });
  }
}

// Create new checkout order
export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingExpedition: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  items: Array<{
    productId: number;
    productName: string;
    productImage: string;
    size: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}) {
  try {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TM-${dateStr}-${randomSuffix}`;

    // Upsert or register customer
    let customerId: number | undefined;
    try {
      const existingCustomer = await db.select().from(customers).where(eq(customers.email, data.customerEmail));
      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
        await db.update(customers)
          .set({
            name: data.customerName,
            phone: data.customerPhone,
            address: data.shippingAddress,
            city: data.shippingCity,
            totalSpent: sql`${customers.totalSpent} + ${data.total}`,
            ordersCount: sql`${customers.ordersCount} + 1`,
          })
          .where(eq(customers.id, customerId));
      } else {
        const newCustomer = await db.insert(customers).values({
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          address: data.shippingAddress,
          city: data.shippingCity,
          totalSpent: data.total,
          ordersCount: 1,
        }).returning();
        customerId = newCustomer[0]?.id;
      }
    } catch (e) {
      console.warn('Customer record sync note:', e);
    }

    // Insert order
    const newOrder = await db.insert(orders).values({
      orderNumber,
      customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingExpedition: data.shippingExpedition,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'MENUNGGU_PEMBAYARAN',
      orderStatus: 'MENUNGGU_KONFIRMASI',
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      discount: data.discount,
      total: data.total,
    }).returning();

    const orderRecord = newOrder[0];

    // Insert items & decrease product stock
    for (const item of data.items) {
      await db.insert(orderItems).values({
        orderId: orderRecord.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      });

      // Decrease stock
      await db.update(products)
        .set({
          stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`,
        })
        .where(eq(products.id, item.productId));
    }

    return await getOrderByNumber(orderNumber);
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error('Failed to create order in database.', { cause: error });
  }
}

// Upload payment proof
export async function uploadPaymentProof(orderNumber: string, proofData: {
  proofUrl: string;
  senderName?: string;
  referenceNumber?: string;
}) {
  try {
    const res = await db.update(orders)
      .set({
        paymentProofUrl: proofData.proofUrl,
        paymentProofSender: proofData.senderName || 'Transfer Pelanggan',
        paymentProofRef: proofData.referenceNumber || 'TRX-REF-' + Date.now().toString().slice(-6),
        paymentProofUploadedAt: new Date(),
        paymentStatus: 'MENUNGGU_APPROVAL',
        updatedAt: new Date(),
      })
      .where(eq(orders.orderNumber, orderNumber))
      .returning();

    return res[0] || null;
  } catch (error) {
    console.error('Failed to upload payment proof:', error);
    throw new Error('Failed to submit payment proof.', { cause: error });
  }
}

// Admin: Approve payment proof
export async function approvePaymentProof(orderId: number) {
  try {
    const res = await db.update(orders)
      .set({
        paymentStatus: 'LUNAS',
        orderStatus: 'DIPROSES',
        adminNotes: 'Bukti pembayaran telah divalidasi dan disetujui oleh Admin.',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return res[0] || null;
  } catch (error) {
    console.error('Failed to approve payment:', error);
    throw new Error('Failed to approve payment proof.', { cause: error });
  }
}

// Admin: Reject payment proof
export async function rejectPaymentProof(orderId: number, reason: string) {
  try {
    const res = await db.update(orders)
      .set({
        paymentStatus: 'DITOLAK',
        adminNotes: `Bukti transfer ditolak: ${reason}`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return res[0] || null;
  } catch (error) {
    console.error('Failed to reject payment proof:', error);
    throw new Error('Failed to reject payment.', { cause: error });
  }
}

// Admin: Update order fulfillment status
export async function updateOrderStatus(orderId: number, status: string, trackingNumber?: string) {
  try {
    const updateData: any = {
      orderStatus: status,
      updatedAt: new Date(),
    };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    const res = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    return res[0] || null;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw new Error('Failed to update order status.', { cause: error });
  }
}

// Admin: Get all customers
export async function getCustomers() {
  try {
    return await db.select().from(customers).orderBy(desc(customers.totalSpent));
  } catch (error) {
    console.error('Failed to get customers:', error);
    throw new Error('Failed to fetch customers.', { cause: error });
  }
}

// Admin: Dashboard sales analytics
export async function getDashboardAnalytics() {
  try {
    const allOrders = await db.select().from(orders);
    const allProducts = await db.select().from(products);
    const allCustomers = await db.select().from(customers);

    let totalRevenue = 0;
    let pendingApprovalCount = 0;
    let paidOrdersCount = 0;

    const paymentMethodsMap: Record<string, number> = {};

    allOrders.forEach((o) => {
      if (o.paymentStatus === 'LUNAS') {
        totalRevenue += o.total;
        paidOrdersCount++;
      }
      if (o.paymentStatus === 'MENUNGGU_APPROVAL') {
        pendingApprovalCount++;
      }
      paymentMethodsMap[o.paymentMethod] = (paymentMethodsMap[o.paymentMethod] || 0) + 1;
    });

    const lowStockProducts = allProducts.filter((p) => p.stock < 25);

    return {
      totalRevenue,
      totalOrders: allOrders.length,
      paidOrdersCount,
      pendingApprovalCount,
      totalProducts: allProducts.length,
      totalCustomers: allCustomers.length,
      paymentDistribution: paymentMethodsMap,
      lowStockProducts,
    };
  } catch (error) {
    console.error('Failed to get dashboard analytics:', error);
    throw new Error('Failed to calculate analytics.', { cause: error });
  }
}
