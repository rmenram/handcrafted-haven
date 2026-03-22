import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

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

    const responseOrders = orders.map((order) => ({
      id: String(order._id),
      date: order.createdAt,
      total: order.total,
      status: order.status,
      items: order.items.length,
    }));

    return NextResponse.json({ orders: responseOrders });
  } catch {
    return NextResponse.json({ message: 'Unable to load orders' }, { status: 500 });
  }
}
