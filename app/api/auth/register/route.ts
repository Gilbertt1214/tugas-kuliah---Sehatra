import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const body = await req.json();
    const { name, email, phone, nik, bpjs_number, password, blood_type, height, weight, birth_date, gender, allergies, chronic_conditions } = body;

    if (!name || !password || !email) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    const existingEmailResult = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });
    if (existingEmailResult.rows.length > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    if (nik) {
      const existingNikResult = await db.execute({
        sql: 'SELECT id FROM users WHERE nik = ?',
        args: [nik]
      });
      if (existingNikResult.rows.length > 0) {
        return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
      }
    }

    const password_hash = hashPassword(password);
    const insertResult = await db.execute({
      sql: 'INSERT INTO users (name, email, phone, nik, bpjs_number, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      args: [name, email, phone || null, nik || null, bpjs_number || null, password_hash]
    });

    const userId = insertResult.lastInsertRowid;
    await db.execute({
      sql: 'INSERT INTO health_profiles (user_id, blood_type, height, weight, birth_date, gender, allergies, chronic_conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [userId, blood_type || null, height || null, weight || null, birth_date || null, gender || null, allergies || null, chronic_conditions || null]
    });

    return NextResponse.json({ message: 'Registrasi berhasil! Silakan login.' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Terjadi kesalahan: ' + message }, { status: 500 });
  }
}
