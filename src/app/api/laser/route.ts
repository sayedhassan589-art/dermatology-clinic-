import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const bodyArea = searchParams.get('bodyArea')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (bodyArea) where.bodyArea = bodyArea

    const [records, total] = await Promise.all([
      db.laserRecord.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true, phone: true, gender: true, age: true } },
          package: true,
          laserSessions: { orderBy: { sessionNumber: 'asc' } },
        },
        orderBy: { sessionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.laserRecord.count({ where }),
    ])

    return NextResponse.json({ records, total, page, limit })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId, packageId, bodyArea, totalSessions, sessionDate, nextSessionDate, status, notes, price, paidAmount, createdBy, skinType, hairColor, skinSensitivity, energyLevel, pulseDuration, spotSize, machineUsed, freezeMethod, numPulses } = body

    if (!patientId || !bodyArea) {
      return NextResponse.json({ error: 'يرجى إدخال بيانات المريض ومنطقة الجسم' }, { status: 400 })
    }

    const record = await db.laserRecord.create({
      data: {
        patientId,
        packageId: packageId || null,
        bodyArea,
        sessionNumber: 1,
        completedSessions: 0,
        totalSessions: totalSessions || 8,
        sessionDate: new Date(sessionDate),
        nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
        status: status || 'active',
        notes,
        price: price ? parseFloat(price) : null,
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
        createdBy,
        skinType: skinType || null,
        hairColor: hairColor || null,
        skinSensitivity: skinSensitivity || null,
        energyLevel: energyLevel || null,
        pulseDuration: pulseDuration || null,
        spotSize: spotSize || null,
        machineUsed: machineUsed || null,
        freezeMethod: freezeMethod || null,
        numPulses: numPulses ? parseInt(numPulses) : null,
      },
      include: { patient: true, package: true, laserSessions: true },
    })

    return NextResponse.json({ record }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
