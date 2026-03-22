import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

const updateMeSchema = z.object({
  name: z.string().trim().min(2),
  email: z.email(),
  phone: z.string().trim().max(30).optional(),
});

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let payload: ReturnType<typeof verifyAuthToken>;
  try {
    payload = verifyAuthToken(token);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const user = await User.findById(payload.sub).select('_id name email role phone').lean();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to load profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    const body = await request.json();
    const parsed = updateMeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid profile data' }, { status: 400 });
    }

    await connectToDatabase();

    const existingEmail = await User.findOne({
      email: parsed.data.email,
      _id: { $ne: payload.sub },
    })
      .select('_id')
      .lean();

    if (existingEmail) {
      return NextResponse.json({ message: 'Email is already in use' }, { status: 409 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      payload.sub,
      {
        $set: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone ?? '',
        },
      },
      { new: true }
    )
      .select('_id name email role phone')
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: String(updatedUser._id),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone ?? '',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Unable to update profile' }, { status: 500 });
  }
}
