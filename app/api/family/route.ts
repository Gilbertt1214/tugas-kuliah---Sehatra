import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const members = db.prepare('SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    return NextResponse.json({ members });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const b = await req.json();
    db.prepare('INSERT INTO family_members (user_id, name, relationship, birth_date, gender, blood_type, allergies, chronic_conditions) VALUES (?,?,?,?,?,?,?,?)').run(user.id, b.name, b.relationship, b.birth_date, b.gender, b.blood_type, b.allergies, b.chronic_conditions);
    return NextResponse.json({ message: 'Anggota keluarga ditambahkan' }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    db.prepare('DELETE FROM family_members WHERE id = ? AND user_id = ?').run(searchParams.get('id'), user.id);
    return NextResponse.json({ message: 'Anggota keluarga dihapus' });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
