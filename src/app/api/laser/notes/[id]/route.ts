import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/laser/notes/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const note = await db.laserNote.findUnique({ where: { id } })
    if (!note) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    return NextResponse.json({ note })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/laser/notes/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const note = await db.laserNote.update({
      where: { id },
      data: {
        ...(body.content !== undefined && { content: body.content }),
        ...(body.isImportant !== undefined && { isImportant: body.isImportant }),
      },
    })
    return NextResponse.json({ note })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/laser/notes/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.laserNote.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
