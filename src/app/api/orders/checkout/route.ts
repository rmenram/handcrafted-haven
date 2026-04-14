import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

type StoredCartItem = {
  productId: Types.ObjectId | string;
  quantity: number;
};

type CheckoutOrderItem = {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  remainingStock: number;
};

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (payload.role !== 'purchaser') {
      return NextResponse.json(
        { message: 'Only purchasers can complete checkout' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(payload.sub).select('role cartItems').lean();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'purchaser') {
      return NextResponse.json(
        { message: 'Only purchasers can complete checkout' },
        { status: 403 }
      );
    }

    const cartItems = Array.isArray(user.cartItems) ? (user.cartItems as StoredCartItem[]) : [];

    if (cartItems.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty' }, { status: 400 });
    }

    const validProductIds = cartItems
      .map((item: StoredCartItem) => String(item.productId))
      .filter((productId: string) => Types.ObjectId.isValid(productId));

    if (validProductIds.length === 0) {
      return NextResponse.json({ message: 'Your cart is invalid' }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: validProductIds } })
      .select('_id name price image artisanName inStock stockQuantity')
      .lean();

    const productById = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = cartItems
      .map((item: StoredCartItem): CheckoutOrderItem | null => {
        const product = productById.get(String(item.productId));

        if (!product) {
          return null;
        }

        const stockQuantity = Number(product.stockQuantity ?? (product.inStock ? 1 : 0));
        const requestedQuantity = Math.max(1, Number(item.quantity ?? 1));

        if (stockQuantity < requestedQuantity) {
          return null;
        }

        return {
          productId: product._id,
          name: product.name,
          price: Number(product.price ?? 0),
          quantity: requestedQuantity,
          remainingStock: stockQuantity - requestedQuantity,
        };
      })
      .filter((item: CheckoutOrderItem | null): item is CheckoutOrderItem => Boolean(item));

    if (orderItems.length !== cartItems.length) {
      return NextResponse.json(
        {
          message: 'Some items no longer have enough stock. Please review your cart and try again.',
        },
        { status: 409 }
      );
    }

    const decrementedItems: Array<{ productId: Types.ObjectId; quantity: number }> = [];

    for (const item of orderItems) {
      const updateResult = await Product.updateOne(
        { _id: item.productId, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } }
      );

      if (updateResult.modifiedCount !== 1) {
        if (decrementedItems.length > 0) {
          await Promise.all(
            decrementedItems.map((decremented) =>
              Product.updateOne(
                { _id: decremented.productId },
                { $inc: { stockQuantity: decremented.quantity } }
              )
            )
          );
        }

        return NextResponse.json(
          {
            message:
              'Some items no longer have enough stock. Please review your cart and try again.',
          },
          { status: 409 }
        );
      }

      decrementedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne({ _id: item.productId }, { $set: { inStock: item.remainingStock > 0 } })
      )
    );

    const total = orderItems.reduce((sum: number, item: CheckoutOrderItem) => {
      return sum + item.price * item.quantity;
    }, 0);

    const order = await Order.create({
      purchaserUserId: payload.sub,
      items: orderItems,
      total,
      status: 'Pending',
    });

    await User.findByIdAndUpdate(payload.sub, { $set: { cartItems: [] } });

    return NextResponse.json({
      message: 'Checkout complete',
      order: {
        id: String(order._id),
        total: Number(order.total ?? 0),
        status: String(order.status ?? 'Pending'),
      },
    });
  } catch (error) {
    console.error('Checkout failed:', error);
    return NextResponse.json({ message: 'Unable to complete checkout' }, { status: 500 });
  }
}
