import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const result = await db.execute({
      sql: 'SELECT * FROM family_members WHERE user_id = ? ORDER BY created_at DESC',
      args: [user.id]
    });
    const members = result.rows;
    
    return NextResponse.json({ members });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const b = await req.json();
    
    await db.execute({
      sql: 'INSERT INTO family_members (user_id, name, relationship, birth_date, gender, blood_type, allergies, chronic_conditions) VALUES (?,?,?,?,?,?,?,?)',
      args: [user.id, b.name, b.relationship, b.birth_date, b.gender, b.blood_type, b.allergies, b.chronic_conditions]
    });
    
    return NextResponse.json({ message: 'Anggota keluarga ditambahkan' }, { status: 201 });
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
      sql: 'DELETE FROM family_members WHERE id = ? AND user_id = ?',
      args: [id, user.id]
    });
    
    return NextResponse.json({ message: 'Anggota keluarga dihapus' });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
