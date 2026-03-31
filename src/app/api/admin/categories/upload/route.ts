import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/auth';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

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

function isWebpBinary(bytes: Buffer) {
  return (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  );
}

export async function POST(request: Request) {
  try {
    const payload = await requireAdminAuth();
    if (!payload) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const fileValue = formData.get('file');

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    if (fileValue.size <= 0) {
      return NextResponse.json({ message: 'Uploaded file is empty' }, { status: 400 });
    }

    if (fileValue.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: 'File too large. Max allowed size is 5MB.' },
        { status: 400 }
      );
    }

    const fileName = fileValue.name.toLowerCase();
    const mimeType = fileValue.type.toLowerCase();

    if (mimeType !== 'image/webp' && !fileName.endsWith('.webp')) {
      return NextResponse.json({ message: 'Only .webp images are accepted' }, { status: 400 });
    }

    const bytes = Buffer.from(await fileValue.arrayBuffer());
    if (!isWebpBinary(bytes)) {
      return NextResponse.json(
        { message: 'Uploaded file is not a valid webp image' },
        { status: 400 }
      );
    }

    const imagesDir = path.join(process.cwd(), 'public', 'images');
    await mkdir(imagesDir, { recursive: true });

    const filename = `category-${Date.now()}-${randomUUID()}.webp`;
    const filePath = path.join(imagesDir, filename);
    await writeFile(filePath, bytes);

    return NextResponse.json({ imagePath: `/images/${filename}` });
  } catch {
    return NextResponse.json({ message: 'Unable to upload image' }, { status: 500 });
  }
}
