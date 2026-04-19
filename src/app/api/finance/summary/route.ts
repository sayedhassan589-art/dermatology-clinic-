import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const dateFilter: any = {}
    if (dateFrom) dateFilter.gte = new Date(dateFrom)
    if (dateTo) dateFilter.lte = new Date(dateTo + 'T23:59:59.999Z')

    const incomeResult = await db.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'income', ...(dateFrom || dateTo ? { date: dateFilter } : {}) },
    })

    const expenseResult = await db.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'expense', ...(dateFrom || dateTo ? { date: dateFilter } : {}) },
    })

    const incomeByCategory = await db.transaction.groupBy({
      by: ['category'],
      where: { type: 'income', ...(dateFrom || dateTo ? { date: dateFilter } : {}) },
      _sum: { amount: true },
    })

    const expenseByCategory = await db.transaction.groupBy({
      by: ['category'],
      where: { type: 'expense', ...(dateFrom || dateTo ? { date: dateFilter } : {}) },
      _sum: { amount: true },
    })

    const totalIncome = incomeResult._sum.amount || 0
    const totalExpenses = expenseResult._sum.amount || 0

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      incomeByCategory,
      expenseByCategory,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
