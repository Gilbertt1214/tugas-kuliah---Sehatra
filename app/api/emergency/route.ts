import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const contactsResult = await db.execute({
      sql: 'SELECT * FROM emergency_contacts WHERE user_id = ?',
      args: [user.id]
    });
    const contacts = contactsResult.rows;
    
    const alertsResult = await db.execute({
      sql: 'SELECT * FROM emergency_alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      args: [user.id]
    });
    const alerts = alertsResult.rows;
    
    return NextResponse.json({ contacts, alerts });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    
    if (body.type === 'contact') {
      await db.execute({
        sql: 'INSERT INTO emergency_contacts (user_id, name, phone, relationship) VALUES (?,?,?,?)',
        args: [user.id, body.name, body.phone, body.relationship]
      });
      return NextResponse.json({ message: 'Kontak darurat ditambahkan' }, { status: 201 });
    } else {
      await db.execute({
        sql: 'INSERT INTO emergency_alerts (user_id, latitude, longitude, address, message) VALUES (?,?,?,?,?)',
        args: [user.id, body.latitude, body.longitude, body.address, body.message || 'DARURAT! Butuh pertolongan segera!']
      });
      return NextResponse.json({ message: 'Alert darurat terkirim!' }, { status: 201 });
    }
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    await db.execute({
      sql: 'DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?',
      args: [id, user.id]
    });
    
    return NextResponse.json({ message: 'Kontak dihapus' });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
