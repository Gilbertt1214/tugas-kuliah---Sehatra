import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const contacts = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = ?').all(user.id);
    const alerts = db.prepare('SELECT * FROM emergency_alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(user.id);
    return NextResponse.json({ contacts, alerts });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (body.type === 'contact') {
      db.prepare('INSERT INTO emergency_contacts (user_id, name, phone, relationship) VALUES (?,?,?,?)').run(user.id, body.name, body.phone, body.relationship);
      return NextResponse.json({ message: 'Kontak darurat ditambahkan' }, { status: 201 });
    } else {
      db.prepare('INSERT INTO emergency_alerts (user_id, latitude, longitude, address, message) VALUES (?,?,?,?,?)').run(user.id, body.latitude, body.longitude, body.address, body.message || 'DARURAT! Butuh pertolongan segera!');
      return NextResponse.json({ message: 'Alert darurat terkirim!' }, { status: 201 });
    }
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    db.prepare('DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?').run(id, user.id);
    return NextResponse.json({ message: 'Kontak dihapus' });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
