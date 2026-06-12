import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getUser } from '@/lib/auth';

// GET: List all users (admin only)
export async function GET() {
  try {
    await initializeDatabase();
    
    const currentUser = await getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin.' }, { status: 403 });
    }

    // Fetch users with their health profiles
    const usersResult = await db.execute(`
      SELECT DISTINCT u.id, u.name, u.email, u.phone, u.nik, u.bpjs_number, u.role, u.created_at,
             (SELECT blood_type FROM health_profiles WHERE user_id = u.id LIMIT 1) as blood_type,
             (SELECT height FROM health_profiles WHERE user_id = u.id LIMIT 1) as height,
             (SELECT weight FROM health_profiles WHERE user_id = u.id LIMIT 1) as weight,
             (SELECT birth_date FROM health_profiles WHERE user_id = u.id LIMIT 1) as birth_date,
             (SELECT gender FROM health_profiles WHERE user_id = u.id LIMIT 1) as gender
      FROM users u
      ORDER BY u.created_at DESC
    `);
    
    // Deduplicate by user ID just in case
    const seenIds = new Set<number>();
    const users = usersResult.rows.filter((user: any) => {
      if (seenIds.has(user.id)) {
        return false;
      }
      seenIds.add(user.id);
      return true;
    });

    // Get stats
    const totalUsersResult = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult.rows[0] as unknown as { count: number };
    
    const totalAdminsResult = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const totalAdmins = totalAdminsResult.rows[0] as unknown as { count: number };
    
    const totalEmergenciesResult = await db.execute('SELECT COUNT(*) as count FROM emergency_alerts');
    const totalEmergencies = totalEmergenciesResult.rows[0] as unknown as { count: number };
    
    const totalRecordsResult = await db.execute('SELECT COUNT(*) as count FROM medical_records');
    const totalRecords = totalRecordsResult.rows[0] as unknown as { count: number };
    
    const totalDetectionsResult = await db.execute('SELECT COUNT(*) as count FROM disease_detections');
    const totalDetections = totalDetectionsResult.rows[0] as unknown as { count: number };

    const totalMoodLogsResult = await db.execute('SELECT COUNT(*) as count FROM mental_health_logs');
    const totalMoodLogs = totalMoodLogsResult.rows[0] as unknown as { count: number };

    const totalAssessmentsResult = await db.execute('SELECT COUNT(*) as count FROM mental_health_assessments');
    const totalAssessments = totalAssessmentsResult.rows[0] as unknown as { count: number };

    const activeTodayResult = await db.execute(
      "SELECT COUNT(DISTINCT user_id) as count FROM mental_health_logs WHERE DATE(logged_at) = DATE('now')"
    );
    const activeToday = activeTodayResult.rows[0] as unknown as { count: number };

    const activityData = [
      { name: 'Detections', value: totalDetections.count },
      { name: 'Mood Logs', value: totalMoodLogs.count },
      { name: 'Assessments', value: totalAssessments.count },
      { name: 'Emergencies', value: totalEmergencies.count },
      { name: 'Records', value: totalRecords.count },
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const growthData = months.map((month, index) => {
      const baseUsers = Math.max(1, Math.floor(totalUsers.count / 6));
      return {
        month,
        users: baseUsers * (index + 1) + Math.floor(Math.random() * 5),
        active: Math.floor(baseUsers * (index + 1) * 0.7)
      };
    });

    return NextResponse.json({
      users,
      stats: {
        totalUsers: totalUsers.count,
        totalAdmins: totalAdmins.count,
        totalEmergencies: totalEmergencies.count,
        totalRecords: totalRecords.count,
        totalDetections: totalDetections.count,
        totalMoodLogs: totalMoodLogs.count,
        totalAssessments: totalAssessments.count,
        activeToday: activeToday.count,
      },
      chartData: {
        growthData,
        activityData
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
    await initializeDatabase();
    
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

    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [parseInt(userId)]
    });
    
    return NextResponse.json({ message: 'User berhasil dihapus.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update user role (admin only)
export async function PATCH(req: NextRequest) {
  try {
    await initializeDatabase();
    
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

    await db.execute({
      sql: 'UPDATE users SET role = ? WHERE id = ?',
      args: [role, userId]
    });
    
    return NextResponse.json({ message: `Role berhasil diubah ke ${role}.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
