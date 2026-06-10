import { NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    
    // Check if table exists
    const tables = await db.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='mental_health_logs'",
      args: []
    });
    
    // Get all mood logs
    const logs = await db.execute({
      sql: 'SELECT * FROM mental_health_logs ORDER BY logged_at DESC',
      args: []
    });
    
    // Get count
    const count = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM mental_health_logs',
      args: []
    });
    
    return NextResponse.json({
      tableExists: tables.rows.length > 0,
      totalLogs: count.rows[0],
      recentLogs: logs.rows
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
