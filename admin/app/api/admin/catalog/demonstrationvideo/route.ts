import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

function toNumber(v: any, fallback?: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const vid = Number(id);
      if (!Number.isFinite(vid)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      const video = await prisma.video.findUnique({ where: { id: vid } });
      if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ video });
    }

    const q = (searchParams.get("q") || "").trim();
    const minPrice = toNumber(searchParams.get("minPrice"), undefined);
    const maxPrice = toNumber(searchParams.get("maxPrice"), undefined);
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 12)));

    const and: any[] = [];
    if (q) and.push({ title: { contains: q, mode: "insensitive" } });
    if (typeof minPrice === "number") and.push({ price: { gte: minPrice } });
    if (typeof maxPrice === "number") and.push({ price: { lte: maxPrice } });
    if (createdFrom) and.push({ createdAt: { gte: new Date(createdFrom) } });
    if (createdTo) and.push({ createdAt: { lte: new Date(createdTo) } });

    

    let total = 0;
    let videos: any[] = [];
    try {
      const res = await prisma.video.findMany({
         
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        })
     
      console.log(res);
      total = await prisma.video.count();
      videos = res;
 
    } catch (err: any) {
      // If Video table doesn't exist, return empty list instead of 500
      if (err?.code === 'P2021' && err?.meta?.modelName === 'Video') {
        console.warn('Video table missing, returning empty list');
        total = 0;
        videos = [];
      } else {
        throw err;
      }
    }

    return NextResponse.json({ videos, total, page, pageSize });
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
