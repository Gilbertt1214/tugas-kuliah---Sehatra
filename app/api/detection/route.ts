import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { detectDisease } from '@/lib/ai-engine';

export async function GET() {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const result = await db.execute({
      sql: 'SELECT * FROM disease_detections WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      args: [user.id]
    });
    const detections = result.rows;
    
    return NextResponse.json({ detections });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { symptoms, description } = await req.json();
    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'Pilih minimal 1 gejala' }, { status: 400 });
    }

    const result = detectDisease(symptoms, description);
    
    await db.execute({
      sql: 'INSERT INTO disease_detections (user_id, symptoms, description, ai_result, risk_level, possible_conditions, recommendations) VALUES (?,?,?,?,?,?,?)',
      args: [user.id, JSON.stringify(symptoms), description || null, JSON.stringify(result), result.riskLevel, JSON.stringify(result.possibleConditions), JSON.stringify(result.recommendations)]
    });
    
    return NextResponse.json({ result }, { status: 201 });
  } catch { 
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); 
  }
}
