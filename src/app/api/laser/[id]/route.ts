import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const record = await db.laserRecord.findUnique({
      where: { id },
      include: { patient: true, package: true, laserSessions: { orderBy: { sessionNumber: 'asc' } } },
    })
    if (!record) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    return NextResponse.json({ record })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const record = await db.laserRecord.update({
      where: { id },
      data: {
        ...(body.bodyArea !== undefined && { bodyArea: body.bodyArea }),
        ...(body.sessionNumber !== undefined && { sessionNumber: parseInt(body.sessionNumber) }),
        ...(body.completedSessions !== undefined && { completedSessions: parseInt(body.completedSessions) }),
        ...(body.totalSessions !== undefined && { totalSessions: parseInt(body.totalSessions) }),
        ...(body.sessionDate !== undefined && { sessionDate: new Date(body.sessionDate) }),
        ...(body.nextSessionDate !== undefined && { nextSessionDate: body.nextSessionDate ? new Date(body.nextSessionDate) : null }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.price !== undefined && { price: body.price ? parseFloat(body.price) : null }),
        ...(body.paidAmount !== undefined && { paidAmount: parseFloat(body.paidAmount) }),
        ...(body.packageId !== undefined && { packageId: body.packageId || null }),
        ...(body.skinType !== undefined && { skinType: body.skinType }),
        ...(body.hairColor !== undefined && { hairColor: body.hairColor }),
        ...(body.skinSensitivity !== undefined && { skinSensitivity: body.skinSensitivity }),
        ...(body.energyLevel !== undefined && { energyLevel: body.energyLevel }),
        ...(body.pulseDuration !== undefined && { pulseDuration: body.pulseDuration }),
        ...(body.spotSize !== undefined && { spotSize: body.spotSize }),
        ...(body.machineUsed !== undefined && { machineUsed: body.machineUsed }),
        ...(body.freezeMethod !== undefined && { freezeMethod: body.freezeMethod }),
        ...(body.numPulses !== undefined && { numPulses: body.numPulses ? parseInt(body.numPulses) : null }),
      },
      include: { patient: true, package: true, laserSessions: true },
    })
    return NextResponse.json({ record })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.laserSession.deleteMany({ where: { laserRecordId: id } })
    await db.laserRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
