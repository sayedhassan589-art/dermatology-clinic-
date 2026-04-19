import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const patientId = searchParams.get('patientId')

    const where: any = {}

    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (type) where.type = type

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.appointmentDate = { gte: startDate, lte: endDate }
    } else if (dateFrom && dateTo) {
      const start = new Date(dateFrom)
      start.setHours(0, 0, 0, 0)
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      where.appointmentDate = { gte: start, lte: end }
    } else if (dateFrom) {
      where.appointmentDate = { gte: new Date(dateFrom) }
    } else if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      where.appointmentDate = { lte: end }
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
              gender: true,
              age: true,
              fileNumber: true,
            },
          },
        },
        orderBy: { appointmentDate: 'asc' },
      }),
      db.appointment.count({ where }),
    ])

    return NextResponse.json({ appointments, total })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      patientId,
      appointmentDate,
      duration,
      type,
      status,
      paymentMethod,
      paymentStatus,
      amount,
      notes,
      createdBy,
    } = body

    if (!patientId || !appointmentDate) {
      return NextResponse.json(
        { error: 'Patient ID and appointment date are required' },
        { status: 400 }
      )
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        appointmentDate: new Date(appointmentDate),
        duration: duration ? parseInt(duration) : 20,
        type: type || 'new_visit',
        status: status || 'pending',
        paymentMethod: paymentMethod || null,
        paymentStatus: paymentStatus || 'unpaid',
        amount: amount !== undefined ? parseFloat(amount) : null,
        notes: notes || null,
        createdBy: createdBy || null,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
            age: true,
            fileNumber: true,
          },
        },
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
