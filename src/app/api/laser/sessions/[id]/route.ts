import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await db.laserSession.findUnique({ where: { id } })
    if (!session) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    return NextResponse.json({ session })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const session = await db.laserSession.update({
      where: { id },
      data: {
        ...(body.sessionDate !== undefined && { sessionDate: new Date(body.sessionDate) }),
        ...(body.nextSessionDate !== undefined && { nextSessionDate: body.nextSessionDate ? new Date(body.nextSessionDate) : null }),
        ...(body.energyLevel !== undefined && { energyLevel: body.energyLevel }),
        ...(body.pulseDuration !== undefined && { pulseDuration: body.pulseDuration }),
        ...(body.spotSize !== undefined && { spotSize: body.spotSize }),
        ...(body.numPulses !== undefined && { numPulses: body.numPulses ? parseInt(body.numPulses) : null }),
        ...(body.freezeMethod !== undefined && { freezeMethod: body.freezeMethod }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.painLevel !== undefined && { painLevel: body.painLevel ? parseInt(body.painLevel) : null }),
        ...(body.skinReaction !== undefined && { skinReaction: body.skinReaction }),
        ...(body.hairReduction !== undefined && { hairReduction: body.hairReduction ? parseInt(body.hairReduction) : null }),
        ...(body.price !== undefined && { price: body.price ? parseFloat(body.price) : null }),
        ...(body.paidAmount !== undefined && { paidAmount: parseFloat(body.paidAmount) }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })
    return NextResponse.json({ session })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await db.laserSession.findUnique({ where: { id } })
    if (session) {
      await db.laserRecord.update({
        where: { id: session.laserRecordId },
        data: { completedSessions: { decrement: 1 } },
      })
    }
    await db.laserSession.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
