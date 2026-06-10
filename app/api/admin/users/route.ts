import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUser } from '@/lib/auth';

// GET: List all users (admin only)
export async function GET() {
  try {
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 });
    }

    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.nik, u.bpjs_number, u.role, u.created_at,
             hp.blood_type, hp.height, hp.weight, hp.birth_date, hp.gender
      FROM users u
      LEFT JOIN health_profiles hp ON u.id = hp.user_id
      ORDER BY u.created_at DESC
    `).all();

    // Get stats
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const totalAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    const totalEmergencies = db.prepare('SELECT COUNT(*) as count FROM emergency_alerts').get() as { count: number };
    const totalRecords = db.prepare('SELECT COUNT(*) as count FROM medical_records').get() as { count: number };
    const totalDetections = db.prepare('SELECT COUNT(*) as count FROM disease_detections').get() as { count: number };

    return NextResponse.json({
      users,
      stats: {
        totalUsers: totalUsers.count,
        totalAdmins: totalAdmins.count,
        totalEmergencies: totalEmergencies.count,
        totalRecords: totalRecords.count,
        totalDetections: totalDetections.count,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Delete a user (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    if (!userId) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    // Prevent admin from deleting themselves
    if (parseInt(userId) === currentUser.id) {
      return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri.' }, { status: 400 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(parseInt(userId));
    return NextResponse.json({ message: 'User berhasil dihapus.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update user role (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) return NextResponse.json({ error: 'userId dan role diperlukan' }, { status: 400 });
    if (!['admin', 'user'].includes(role)) return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });

    // Prevent admin from changing their own role
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Tidak bisa mengubah role akun sendiri.' }, { status: 400 });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
    return NextResponse.json({ message: `Role berhasil diubah ke ${role}.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
