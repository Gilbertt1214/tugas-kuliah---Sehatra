import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';
import { assessMentalHealth } from '@/lib/ai-engine';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const logs = db.prepare('SELECT * FROM mental_health_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 30').all(user.id);
    const assessments = db.prepare('SELECT * FROM mental_health_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(user.id);
    return NextResponse.json({ logs, assessments });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    if (body.type === 'mood') {
      db.prepare('INSERT INTO mental_health_logs (user_id, mood_score, energy_level, stress_level, sleep_quality, notes, activities) VALUES (?,?,?,?,?,?,?)').run(user.id, body.mood_score, body.energy_level, body.stress_level, body.sleep_quality, body.notes, body.activities);
      return NextResponse.json({ message: 'Mood tercatat' }, { status: 201 });
    } else {
      const result = assessMentalHealth(body.answers);
      db.prepare('INSERT INTO mental_health_assessments (user_id, assessment_type, answers, total_score, risk_level, recommendations) VALUES (?,?,?,?,?,?)').run(user.id, body.assessment_type || 'PHQ-9', JSON.stringify(body.answers), result.score, result.riskLevel, JSON.stringify(result.recommendations));
      return NextResponse.json({ result }, { status: 201 });
    }
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
