import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { syncReviewStatsForProducts } from '@/lib/reviewStats';

const syncSchema = z.object({
  productIds: z.array(z.string().min(1)).optional(),
});

async function requireAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    await connectToDatabase();

    const result = await syncReviewStatsForProducts(parsed.data.productIds);

    return NextResponse.json({
      message: 'Review stats synchronized',
      ...result,
    });
  } catch {
    return NextResponse.json({ message: 'Unable to synchronize review stats' }, { status: 500 });
  }
}
