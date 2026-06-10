import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';
import { detectDisease } from '@/lib/ai-engine';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const detections = db.prepare('SELECT * FROM disease_detections WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(user.id);
    return NextResponse.json({ detections });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { symptoms, description } = await req.json();
    if (!symptoms || symptoms.length === 0) return NextResponse.json({ error: 'Pilih minimal 1 gejala' }, { status: 400 });

    const result = detectDisease(symptoms, description);
    db.prepare('INSERT INTO disease_detections (user_id, symptoms, description, ai_result, risk_level, possible_conditions, recommendations) VALUES (?,?,?,?,?,?,?)').run(user.id, JSON.stringify(symptoms), description || null, JSON.stringify(result), result.riskLevel, JSON.stringify(result.possibleConditions), JSON.stringify(result.recommendations));
    return NextResponse.json({ result }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
