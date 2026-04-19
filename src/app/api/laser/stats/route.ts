import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const dateFilter: any = {}
    if (dateFrom && dateTo) {
      dateFilter.sessionDate = { gte: new Date(dateFrom), lte: new Date(dateTo) }
    } else if (period === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter.sessionDate = { gte: today }
    } else if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter.sessionDate = { gte: weekAgo }
    } else if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter.sessionDate = { gte: monthAgo }
    } else if (period === 'year') {
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      dateFilter.sessionDate = { gte: yearAgo }
    }

    const allRecords = await db.laserRecord.findMany({
      where: dateFilter,
      include: { patient: { select: { id: true, name: true, phone: true, gender: true } }, package: true, laserSessions: true },
      orderBy: { sessionDate: 'desc' },
    })

    const totalRecords = allRecords.length
    const activeRecords = allRecords.filter(r => r.status === 'active').length
    const completedRecords = allRecords.filter(r => r.status === 'completed').length
    const pausedRecords = allRecords.filter(r => r.status === 'paused').length

    const totalRevenue = allRecords.reduce((sum, r) => sum + (r.paidAmount || 0), 0)
    const totalExpected = allRecords.reduce((sum, r) => sum + (r.price || 0), 0)
    const remainingAmount = totalExpected - totalRevenue

    const totalSessionsCompleted = allRecords.reduce((sum, r) => sum + (r.completedSessions || 0), 0)
    const totalSessionsPlanned = allRecords.reduce((sum, r) => sum + (r.totalSessions || 0), 0)

    // Body area distribution
    const bodyAreaCounts: Record<string, number> = {}
    allRecords.forEach(r => {
      bodyAreaCounts[r.bodyArea] = (bodyAreaCounts[r.bodyArea] || 0) + 1
    })
    const bodyAreaStats = Object.entries(bodyAreaCounts)
      .map(([area, count]) => ({ area, count, percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)

    // Monthly revenue (last 12 months)
    const monthlyRevenue: Record<string, { revenue: number; sessions: number; cases: number }> = {}
    allRecords.forEach(r => {
      const monthKey = new Date(r.sessionDate).toISOString().slice(0, 7)
      if (!monthlyRevenue[monthKey]) monthlyRevenue[monthKey] = { revenue: 0, sessions: 0, cases: 0 }
      monthlyRevenue[monthKey].revenue += r.paidAmount || 0
      monthlyRevenue[monthKey].sessions += r.completedSessions || 0
      monthlyRevenue[monthKey].cases += 1
    })
    const monthlyStats = Object.entries(monthlyRevenue)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)

    // Skin type distribution
    const skinTypeCounts: Record<string, number> = {}
    allRecords.forEach(r => {
      if (r.skinType) skinTypeCounts[r.skinType] = (skinTypeCounts[r.skinType] || 0) + 1
    })
    const skinTypeStats = Object.entries(skinTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    // Gender distribution
    const maleCount = allRecords.filter(r => r.patient?.gender === 'ذكر').length
    const femaleCount = allRecords.filter(r => r.patient?.gender === 'أنثى').length

    // Upcoming sessions (next 7 days)
    const upcomingSessions = allRecords.filter(r => {
      if (!r.nextSessionDate || r.status !== 'active') return false
      const next = new Date(r.nextSessionDate)
      const now = new Date()
      const weekLater = new Date()
      weekLater.setDate(weekLater.getDate() + 7)
      return next >= now && next <= weekLater
    })

    // Top packages
    const packageStats = await db.laserPackage.findMany({
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Patient retention rate
    const uniquePatients = new Set(allRecords.map(r => r.patientId)).size
    const returningPatients = allRecords.filter(r => r.completedSessions > 1).length
    const retentionRate = uniquePatients > 0 ? Math.round((returningPatients / uniquePatients) * 100) : 0

    // Average sessions per case
    const avgSessionsPerCase = totalRecords > 0 ? Math.round(totalSessionsCompleted / totalRecords * 10) / 10 : 0

    return NextResponse.json({
      summary: {
        totalRecords,
        activeRecords,
        completedRecords,
        pausedRecords,
        totalRevenue,
        totalExpected,
        remainingAmount,
        totalSessionsCompleted,
        totalSessionsPlanned,
        uniquePatients,
        maleCount,
        femaleCount,
        retentionRate,
        avgSessionsPerCase,
        upcomingSessionsCount: upcomingSessions.length,
      },
      bodyAreaStats,
      monthlyStats,
      skinTypeStats,
      packageStats,
      upcomingSessions,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
