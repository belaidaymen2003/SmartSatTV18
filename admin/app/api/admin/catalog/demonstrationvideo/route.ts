import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

function toNumber(v: any, fallback?: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  try {
    // Temporary bypass DB to isolate error source
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 12)));
    return NextResponse.json({ videos: [], total: 0, page, pageSize });
  } catch (error: any) {
    console.error('DEMO GET ERROR', error);
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, thumbnail, videoUrl, price } = body || {};
    if (!title || !videoUrl || typeof price === "undefined") return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const created = await prisma.video.create({
      data: {
        title: String(title),
        description: description ? String(description) : null,
        thumbnail: thumbnail ? String(thumbnail) : null,
        videoUrl: String(videoUrl),
        price: toNumber(price, 0) ?? 0,
      },
    });

    return NextResponse.json({ message: "Created", video: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, thumbnail, videoUrl, price } = body || {};
    const vid = Number(id);
    if (!vid || !Number.isFinite(vid)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const updated = await prisma.video.update({
      where: { id: vid },
      data: {
        title: typeof title !== "undefined" ? String(title) : undefined,
        description: typeof description !== "undefined" ? (description ? String(description) : null) : undefined,
        thumbnail: typeof thumbnail !== "undefined" ? (thumbnail ? String(thumbnail) : null) : undefined,
        videoUrl: typeof videoUrl !== "undefined" ? String(videoUrl) : undefined,
        price: typeof price !== "undefined" ? toNumber(price, 0) : undefined,
      },
    });

    return NextResponse.json({ message: "Updated", video: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id || !Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await prisma.video.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}
