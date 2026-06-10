import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, nik, bpjs_number, password, blood_type, height, weight, birth_date, gender, allergies, chronic_conditions } = body;

    if (!name || !password || !email) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });

    if (nik) {
      const existingNik = db.prepare('SELECT id FROM users WHERE nik = ?').get(nik);
      if (existingNik) return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
    }

    const password_hash = hashPassword(password);
    const result = db.prepare('INSERT INTO users (name, email, phone, nik, bpjs_number, password_hash) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, phone || null, nik || null, bpjs_number || null, password_hash);

    const userId = result.lastInsertRowid;
    db.prepare('INSERT INTO health_profiles (user_id, blood_type, height, weight, birth_date, gender, allergies, chronic_conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(userId, blood_type || null, height || null, weight || null, birth_date || null, gender || null, allergies || null, chronic_conditions || null);

    return NextResponse.json({ message: 'Registrasi berhasil! Silakan login.' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Terjadi kesalahan: ' + message }, { status: 500 });
  }
}
