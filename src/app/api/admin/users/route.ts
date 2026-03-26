import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

const updateUserSchema = z.object({
  userId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.email().optional(),
  phone: z.string().trim().max(30).optional(),
  role: z.enum(['purchaser', 'artisan', 'admin']).optional(),
  profileImage: z.string().trim().url().or(z.literal('')).optional(),
  location: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(400).optional(),
  specialties: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  artisanRating: z.number().min(0).max(5).optional(),
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

export async function GET() {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const users = await User.find({})
      .select(
        '_id name email role phone profileImage location bio specialties memberSince artisanRating createdAt'
      )
      .sort({ role: 1, name: 1 })
      .lean();

    return NextResponse.json({
      users: users.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
        profileImage: user.profileImage ?? '',
        location: user.location ?? '',
        bio: user.bio ?? '',
        specialties: Array.isArray(user.specialties) ? user.specialties : [],
        memberSince: user.memberSince ?? null,
        artisanRating: Number(user.artisanRating ?? 0),
        createdAt: user.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ message: 'Unable to load users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid user update payload' }, { status: 400 });
    }

    await connectToDatabase();

    if (parsed.data.email) {
      const existingEmail = await User.findOne({
        email: parsed.data.email,
        _id: { $ne: parsed.data.userId },
      })
        .select('_id')
        .lean();

      if (existingEmail) {
        return NextResponse.json({ message: 'Email is already in use' }, { status: 409 });
      }
    }

    const updateSet: Record<string, unknown> = {};

    if (typeof parsed.data.name === 'string') updateSet.name = parsed.data.name;
    if (typeof parsed.data.email === 'string') updateSet.email = parsed.data.email;
    if (typeof parsed.data.phone === 'string') updateSet.phone = parsed.data.phone;
    if (typeof parsed.data.role === 'string') updateSet.role = parsed.data.role;
    if (typeof parsed.data.profileImage === 'string')
      updateSet.profileImage = parsed.data.profileImage;
    if (typeof parsed.data.location === 'string') updateSet.location = parsed.data.location;
    if (typeof parsed.data.bio === 'string') updateSet.bio = parsed.data.bio;
    if (Array.isArray(parsed.data.specialties)) updateSet.specialties = parsed.data.specialties;
    if (typeof parsed.data.artisanRating === 'number')
      updateSet.artisanRating = parsed.data.artisanRating;

    const updatedUser = await User.findByIdAndUpdate(
      parsed.data.userId,
      { $set: updateSet },
      { new: true }
    )
      .select(
        '_id name email role phone profileImage location bio specialties memberSince artisanRating createdAt'
      )
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
        profileImage: updatedUser.profileImage ?? '',
        location: updatedUser.location ?? '',
        bio: updatedUser.bio ?? '',
        specialties: Array.isArray(updatedUser.specialties) ? updatedUser.specialties : [],
        memberSince: updatedUser.memberSince ?? null,
        artisanRating: Number(updatedUser.artisanRating ?? 0),
        createdAt: updatedUser.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Unable to update user' }, { status: 500 });
  }
}
