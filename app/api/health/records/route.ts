import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const records = db.prepare('SELECT * FROM medical_records WHERE user_id = ? ORDER BY visit_date DESC').all(user.id);
    const bookings = db.prepare('SELECT * FROM doctor_bookings WHERE user_id = ? ORDER BY booking_date DESC').all(user.id);
    return NextResponse.json({ records, bookings });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (body.type === 'record') {
      db.prepare('INSERT INTO medical_records (user_id, record_type, doctor_name, facility, diagnosis, prescription, notes, visit_date) VALUES (?,?,?,?,?,?,?,?)').run(user.id, body.record_type, body.doctor_name, body.facility, body.diagnosis, body.prescription, body.notes, body.visit_date);
    } else {
      db.prepare('INSERT INTO doctor_bookings (user_id, doctor_name, specialty, facility, booking_date, booking_time, notes) VALUES (?,?,?,?,?,?,?)').run(user.id, body.doctor_name, body.specialty, body.facility, body.booking_date, body.booking_time, body.notes);
    }
    return NextResponse.json({ message: 'Data berhasil disimpan' }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
