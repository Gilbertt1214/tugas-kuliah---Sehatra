import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const result = await db.execute({
      sql: 'SELECT * FROM health_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 100',
      args: [user.id]
    });
    const metrics = result.rows;
    
    return NextResponse.json({ metrics });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { metric_type, value, unit, notes } = await req.json();
    if (!metric_type || value === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    
    await db.execute({
      sql: 'INSERT INTO health_metrics (user_id, metric_type, value, unit, notes) VALUES (?, ?, ?, ?, ?)',
      args: [user.id, metric_type, value, unit || null, notes || null]
    });
    
    return NextResponse.json({ message: 'Data berhasil disimpan' }, { status: 201 });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
