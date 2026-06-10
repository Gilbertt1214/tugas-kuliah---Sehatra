import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { verifyPassword, createToken, setTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email/NIK dan password wajib diisi' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? OR nik = ? OR bpjs_number = ?',
      args: [identifier, identifier, identifier]
    });
    const user = result.rows[0] as unknown as Record<string, unknown> | undefined;

    if (!user || !verifyPassword(password, user.password_hash as string)) {
      return NextResponse.json({ error: 'Email/NIK atau password salah' }, { status: 401 });
    }

    const token = await createToken({ id: user.id as number, email: user.email as string, name: user.name as string, role: user.role as string });
    const response = NextResponse.json({ message: 'Login berhasil', user: { id: user.id, name: user.name, email: user.email } });
    response.headers.set('Set-Cookie', setTokenCookie(token));
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Terjadi kesalahan: ' + message }, { status: 500 });
  }
}
