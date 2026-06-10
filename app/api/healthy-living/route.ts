import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const goalsResult = await db.execute({
      sql: 'SELECT * FROM health_goals WHERE user_id = ? ORDER BY created_at DESC',
      args: [user.id]
    });
    const goals = goalsResult.rows;
    
    const medicationsResult = await db.execute({
      sql: 'SELECT * FROM medications WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
      args: [user.id]
    });
    const medications = medicationsResult.rows;
    
    const remindersResult = await db.execute({
      sql: 'SELECT * FROM health_reminders WHERE user_id = ? AND is_active = 1 ORDER BY reminder_time ASC',
      args: [user.id]
    });
    const reminders = remindersResult.rows;
    
    return NextResponse.json({ goals, medications, reminders });
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

    if (body.type === 'goal') {
      await db.execute({
        sql: 'INSERT INTO health_goals (user_id, goal_type, title, target_value, unit, deadline) VALUES (?,?,?,?,?,?)',
        args: [user.id, body.goal_type, body.title, body.target_value, body.unit, body.deadline]
      });
    } else if (body.type === 'medication') {
      await db.execute({
        sql: 'INSERT INTO medications (user_id, name, dosage, frequency, time_of_day, start_date, end_date, notes) VALUES (?,?,?,?,?,?,?,?)',
        args: [user.id, body.name, body.dosage, body.frequency, body.time_of_day, body.start_date, body.end_date, body.notes]
      });
    } else if (body.type === 'reminder') {
      await db.execute({
        sql: 'INSERT INTO health_reminders (user_id, reminder_type, title, description, reminder_time, is_recurring, recurrence_pattern) VALUES (?,?,?,?,?,?,?)',
        args: [user.id, body.reminder_type, body.title, body.description, body.reminder_time, body.is_recurring ? 1 : 0, body.recurrence_pattern]
      });
    } else if (body.type === 'update_goal') {
      await db.execute({
        sql: 'UPDATE health_goals SET current_value = ? WHERE id = ? AND user_id = ?',
        args: [body.current_value, body.id, user.id]
      });
    }
    
    return NextResponse.json({ message: 'Berhasil disimpan' }, { status: 201 });
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
    const t = searchParams.get('type');
    
    if (t === 'goal') {
      await db.execute({
        sql: 'DELETE FROM health_goals WHERE id = ? AND user_id = ?',
        args: [id, user.id]
      });
    } else if (t === 'medication') {
      await db.execute({
        sql: 'UPDATE medications SET is_active = 0 WHERE id = ? AND user_id = ?',
        args: [id, user.id]
      });
    } else if (t === 'reminder') {
      await db.execute({
        sql: 'UPDATE health_reminders SET is_active = 0 WHERE id = ? AND user_id = ?',
        args: [id, user.id]
      });
    }
    
    return NextResponse.json({ message: 'Berhasil dihapus' });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
