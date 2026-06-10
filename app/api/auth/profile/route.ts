import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser, clearTokenCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = db.prepare('SELECT * FROM health_profiles WHERE user_id = ?').get(user.id);
    const userData = db.prepare('SELECT id, name, email, phone, nik, bpjs_number, avatar_url, role, created_at FROM users WHERE id = ?').get(user.id);

    return NextResponse.json({ user: userData, profile });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logout berhasil' });
  response.headers.set('Set-Cookie', clearTokenCookie());
  return response;
}
