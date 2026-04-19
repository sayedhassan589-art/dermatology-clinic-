import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    const whereDate: any = {}
    if (dateFrom && dateTo) {
      whereDate.gte = new Date(dateFrom)
      whereDate.lte = new Date(dateTo)
      whereDate.lte.setHours(23, 59, 59, 999)
    } else {
      whereDate.gte = today
      whereDate.lte = endOfToday
    }

    const [total, todayCount, confirmed, completed, cancelled, noShow, upcoming, paidAppointments] = await Promise.all([
      db.appointment.count({}),
      db.appointment.count({ where: { appointmentDate: { gte: today, lte: endOfToday } } }),
      db.appointment.count({ where: { status: 'confirmed' } }),
      db.appointment.count({ where: { status: 'completed' } }),
      db.appointment.count({ where: { status: 'cancelled' } }),
      db.appointment.count({ where: { status: 'no_show' } }),
      db.appointment.count({ where: { appointmentDate: { gte: today }, status: { in: ['pending', 'confirmed'] } } }),
      db.appointment.aggregate({ where: { paymentStatus: 'paid' }, _sum: { amount: true } }),
    ])

    // Type distribution
    const typeStats = await db.appointment.groupBy({
      by: ['type'],
      _count: { id: true },
    })

    // Daily stats for last 7 days
    const last7Days = await db.appointment.groupBy({
      by: ['appointmentDate'],
      where: { appointmentDate: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      _count: { id: true },
    })

    return NextResponse.json({
      summary: {
        total,
        today: todayCount,
        confirmed,
        completed,
        cancelled,
        noShow,
        upcoming,
        totalRevenue: paidAppointments._sum.amount || 0,
        noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      typeStats: typeStats.map(t => ({ type: t.type, count: t._count.id })),
      dailyStats: last7Days.map(d => ({
        date: d.appointmentDate,
        count: d._count.id,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
