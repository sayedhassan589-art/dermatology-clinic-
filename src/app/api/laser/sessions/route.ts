import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const laserRecordId = searchParams.get('laserRecordId')
    if (!laserRecordId) {
      return NextResponse.json({ error: 'يرجى تحديد سجل الليزر' }, { status: 400 })
    }

    const sessions = await db.laserSession.findMany({
      where: { laserRecordId },
      orderBy: { sessionNumber: 'asc' },
    })

    return NextResponse.json({ sessions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { laserRecordId, sessionNumber, sessionDate, nextSessionDate, energyLevel, pulseDuration, spotSize, numPulses, freezeMethod, notes, painLevel, skinReaction, hairReduction, price, paidAmount, status, createdBy } = body

    if (!laserRecordId || !sessionNumber || !sessionDate) {
      return NextResponse.json({ error: 'يرجى إدخال بيانات الجلسة المطلوبة' }, { status: 400 })
    }

    const session = await db.laserSession.create({
      data: {
        laserRecordId,
        sessionNumber: parseInt(sessionNumber),
        sessionDate: new Date(sessionDate),
        nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
        energyLevel: energyLevel || null,
        pulseDuration: pulseDuration || null,
        spotSize: spotSize || null,
        numPulses: numPulses ? parseInt(numPulses) : null,
        freezeMethod: freezeMethod || null,
        notes: notes || null,
        painLevel: painLevel ? parseInt(painLevel) : null,
        skinReaction: skinReaction || null,
        hairReduction: hairReduction ? parseInt(hairReduction) : null,
        price: price ? parseFloat(price) : null,
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
        status: status || 'completed',
        createdBy: createdBy || null,
      },
    })

    // Update parent record's completed sessions and next session date
    const updatedRecord = await db.laserRecord.update({
      where: { id: laserRecordId },
      data: {
        completedSessions: { increment: 1 },
        nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
        ...(status === 'completed' && {
          sessionNumber: { increment: 1 },
        }),
      },
    })

    return NextResponse.json({ session, updatedRecord }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
