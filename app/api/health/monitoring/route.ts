import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const metrics = db.prepare('SELECT * FROM health_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 100').all(user.id);
    return NextResponse.json({ metrics });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { metric_type, value, unit, notes } = await req.json();
    if (!metric_type || value === undefined) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    db.prepare('INSERT INTO health_metrics (user_id, metric_type, value, unit, notes) VALUES (?, ?, ?, ?, ?)').run(user.id, metric_type, value, unit || null, notes || null);
    return NextResponse.json({ message: 'Data berhasil disimpan' }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
