import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

type OrderLineItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type OrderResponseItem = {
  id: string;
  date: string;
  total: number;
  status: string;
  items: OrderLineItem[];
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (payload.role !== 'purchaser') {
      return NextResponse.json({ message: 'Only purchasers can access orders' }, { status: 403 });
    }

    await connectToDatabase();

    const orders = await Order.find({ purchaserUserId: payload.sub })
      .sort({ createdAt: -1 })
      .lean();

    const responseOrders: OrderResponseItem[] = orders.map((order) => {
      const items = Array.isArray(order.items) ? order.items : [];

      return {
        id: String(order._id),
        date: String(order.createdAt),
        total: Number(order.total ?? 0),
        status: String(order.status ?? 'Pending'),
        items: items.map(
          (item: { productId?: unknown; name?: unknown; price?: unknown; quantity?: unknown }) => ({
            productId: String(item.productId ?? ''),
            name: String(item.name ?? ''),
            price: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            subtotal: Number(item.price ?? 0) * Number(item.quantity ?? 1),
          })
        ),
      };
    });

    return NextResponse.json({ orders: responseOrders });
  } catch {
    return NextResponse.json({ message: 'Unable to load orders' }, { status: 500 });
  }
}
