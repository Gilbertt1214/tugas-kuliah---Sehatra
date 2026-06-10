import { NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 });
    }

    // Get recent activity from various tables
    const logs: Array<{
      id: number;
      user_id: number;
      user_name: string;
      action: string;
      description: string;
      created_at: string;
    }> = [];

    // Recent mood logs
    const moodLogsResult = await db.execute(`
      SELECT ml.id, ml.user_id, u.name as user_name, ml.logged_at as created_at
      FROM mental_health_logs ml
      JOIN users u ON ml.user_id = u.id
      ORDER BY ml.logged_at DESC
      LIMIT 10
    `);
    moodLogsResult.rows.forEach((row: any) => {
      logs.push({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        action: 'MOOD_LOG',
        description: 'Mencatat mood harian',
        created_at: row.created_at
      });
    });

    // Recent disease detections
    const detectionsResult = await db.execute(`
      SELECT dd.id, dd.user_id, u.name as user_name, dd.created_at
      FROM disease_detections dd
      JOIN users u ON dd.user_id = u.id
      ORDER BY dd.created_at DESC
      LIMIT 10
    `);
    detectionsResult.rows.forEach((row: any) => {
      logs.push({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        action: 'DISEASE_DETECTION',
        description: 'Melakukan deteksi penyakit',
        created_at: row.created_at
      });
    });

    // Recent emergency alerts
    const emergenciesResult = await db.execute(`
      SELECT ea.id, ea.user_id, u.name as user_name, ea.created_at
      FROM emergency_alerts ea
      JOIN users u ON ea.user_id = u.id
      ORDER BY ea.created_at DESC
      LIMIT 10
    `);
    emergenciesResult.rows.forEach((row: any) => {
      logs.push({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        action: 'EMERGENCY',
        description: 'Mengirim peringatan darurat',
        created_at: row.created_at
      });
    });

    // Sort all logs by date
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ logs: logs.slice(0, 50) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
