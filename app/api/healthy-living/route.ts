import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const goals = db.prepare('SELECT * FROM health_goals WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    const medications = db.prepare('SELECT * FROM medications WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC').all(user.id);
    const reminders = db.prepare('SELECT * FROM health_reminders WHERE user_id = ? AND is_active = 1 ORDER BY reminder_time ASC').all(user.id);
    return NextResponse.json({ goals, medications, reminders });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    if (body.type === 'goal') {
      db.prepare('INSERT INTO health_goals (user_id, goal_type, title, target_value, unit, deadline) VALUES (?,?,?,?,?,?)').run(user.id, body.goal_type, body.title, body.target_value, body.unit, body.deadline);
    } else if (body.type === 'medication') {
      db.prepare('INSERT INTO medications (user_id, name, dosage, frequency, time_of_day, start_date, end_date, notes) VALUES (?,?,?,?,?,?,?,?)').run(user.id, body.name, body.dosage, body.frequency, body.time_of_day, body.start_date, body.end_date, body.notes);
    } else if (body.type === 'reminder') {
      db.prepare('INSERT INTO health_reminders (user_id, reminder_type, title, description, reminder_time, is_recurring, recurrence_pattern) VALUES (?,?,?,?,?,?,?)').run(user.id, body.reminder_type, body.title, body.description, body.reminder_time, body.is_recurring ? 1 : 0, body.recurrence_pattern);
    } else if (body.type === 'update_goal') {
      db.prepare('UPDATE health_goals SET current_value = ? WHERE id = ? AND user_id = ?').run(body.current_value, body.id, user.id);
    }
    return NextResponse.json({ message: 'Berhasil disimpan' }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const t = searchParams.get('type');
    if (t === 'goal') db.prepare('DELETE FROM health_goals WHERE id = ? AND user_id = ?').run(id, user.id);
    else if (t === 'medication') db.prepare('UPDATE medications SET is_active = 0 WHERE id = ? AND user_id = ?').run(id, user.id);
    else if (t === 'reminder') db.prepare('UPDATE health_reminders SET is_active = 0 WHERE id = ? AND user_id = ?').run(id, user.id);
    return NextResponse.json({ message: 'Berhasil dihapus' });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
