import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await req.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array diperlukan' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userIds.includes(currentUser.id)) {
      return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri.' }, { status: 400 });
    }

    // Delete all users in the array
    const placeholders = userIds.map(() => '?').join(',');
    await db.execute({
      sql: `DELETE FROM users WHERE id IN (${placeholders})`,
      args: userIds
    });
    
    return NextResponse.json({ 
      message: `${userIds.length} pengguna berhasil dihapus.`,
      deleted: userIds.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
