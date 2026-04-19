import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/laser/notes?laserRecordId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const laserRecordId = searchParams.get('laserRecordId')
    if (!laserRecordId) {
      return NextResponse.json({ error: 'يرجى تحديد حالة الليزر' }, { status: 400 })
    }
    const notes = await db.laserNote.findMany({
      where: { laserRecordId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ notes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/laser/notes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { laserRecordId, content, isImportant, createdBy } = body
    if (!laserRecordId || !content?.trim()) {
      return NextResponse.json({ error: 'يرجى إدخال محتوى الملاحظة وحالة الليزر' }, { status: 400 })
    }
    const note = await db.laserNote.create({
      data: {
        laserRecordId,
        content: content.trim(),
        isImportant: isImportant || false,
        createdBy: createdBy || null,
      },
    })
    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
