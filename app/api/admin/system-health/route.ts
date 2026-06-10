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

    // Get database stats
    const tablesResult = await db.execute(`
      SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'
    `);
    const totalTables = (tablesResult.rows[0] as unknown as { count: number }).count;

    // Calculate uptime (mock - dalam production bisa dari environment variable)
    const uptimeHours = Math.floor(process.uptime() / 3600);
    const uptimeMinutes = Math.floor((process.uptime() % 3600) / 60);
    const uptime = `${uptimeHours}h ${uptimeMinutes}m`;

    // Database size (mock - dalam production bisa dari file system)
    const databaseSize = '2.4 MB';

    // Last backup (mock - dalam production dari schedule backup)
    const lastBackup = new Date().toLocaleDateString('id-ID');

    return NextResponse.json({
      databaseSize,
      totalTables,
      uptime,
      lastBackup,
      status: 'healthy'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
