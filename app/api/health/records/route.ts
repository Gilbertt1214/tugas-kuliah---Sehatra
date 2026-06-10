import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const recordsResult = await db.execute({
      sql: 'SELECT * FROM medical_records WHERE user_id = ? ORDER BY visit_date DESC',
      args: [user.id]
    });
    const records = recordsResult.rows;
    
    const bookingsResult = await db.execute({
      sql: 'SELECT * FROM doctor_bookings WHERE user_id = ? ORDER BY booking_date DESC',
      args: [user.id]
    });
    const bookings = bookingsResult.rows;
    
    return NextResponse.json({ records, bookings });
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
    
    if (body.type === 'record') {
      await db.execute({
        sql: 'INSERT INTO medical_records (user_id, record_type, doctor_name, facility, diagnosis, prescription, notes, visit_date) VALUES (?,?,?,?,?,?,?,?)',
        args: [user.id, body.record_type, body.doctor_name, body.facility, body.diagnosis, body.prescription, body.notes, body.visit_date]
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO doctor_bookings (user_id, doctor_name, specialty, facility, booking_date, booking_time, notes) VALUES (?,?,?,?,?,?,?)',
        args: [user.id, body.doctor_name, body.specialty, body.facility, body.booking_date, body.booking_time, body.notes]
      });
    }
    
    return NextResponse.json({ message: 'Data berhasil disimpan' }, { status: 201 });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
