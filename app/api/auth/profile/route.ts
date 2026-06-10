import { NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser, clearTokenCookie } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profileResult = await db.execute({
      sql: 'SELECT * FROM health_profiles WHERE user_id = ?',
      args: [user.id]
    });
    const profile = profileResult.rows[0];

    const userDataResult = await db.execute({
      sql: 'SELECT id, name, email, phone, nik, bpjs_number, avatar_url, role, created_at FROM users WHERE id = ?',
      args: [user.id]
    });
    const userData = userDataResult.rows[0];

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
