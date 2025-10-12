import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@/lib/generated/prisma";
enum Category {
  IPTV,
  STREAMING
}
const prisma = new PrismaClient();

// Helper to map known slugs to categories
function categoryFromSlug(slug?: string | null): string | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s === "iptv") return "IPTV";
  if (s === "streaming") return "STREAMING";
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const channelId = Number(id);
      if (!Number.isFinite(channelId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }
      try {
        const channel = await prisma.iPTVChannel.findUnique({ where: { id: channelId } });
        if (!channel) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ channel });
      } catch {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 12)));

    const and: any[] = [];
    const slugCat = categoryFromSlug(slug);
    if (slugCat) and.push({ category: slugCat as any });
    if (category && category !== "All") and.push({ category: category as any });
    if (q) and.push({ name: { contains: q, mode: "insensitive" } });
    const where = and.length ? { AND: and } : {};

    try {
      const [total, channels] = await Promise.all([
        prisma.iPTVChannel.count({ where }),
        prisma.iPTVChannel.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return NextResponse.json({ channels, total, page, pageSize });
    } catch (err:any){
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, category, description,  logoUrl } =
      await request.json();

    try {
      const created = await prisma.iPTVChannel.create({
        data: {
          name: title,
          category: category,

          description: description,

          logo: logoUrl,
        },
      });

      return NextResponse.json(
        { message: "Created", channel: created },
        { status: 201 }
      );
    } catch (err:any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, title, url, logo, logoUrl, description, category, cost } =
      body || {};
    const channelId = Number(id);
    if (!Number.isFinite(channelId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
      const updated = await prisma.iPTVChannel.update({
        where: { id: channelId },
        data: {
           name: name ?? title ,
           description ,
           category ,
           logo: logo ?? logoUrl ,
        },
      });

      return NextResponse.json({ message: "Updated", channel: updated });
    } catch (err) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const channelId =  Number(idParam) ;
//console.log("channelId",channelId,idParam ,searchParams)


    if (!channelId || !Number.isFinite(channelId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
      await prisma.subscription.deleteMany({ where: { 
        channelId: Number(channelId) } as any 
      }
      );

     await prisma.iPTVChannel.delete({ where: { id: Number(channelId) } as any });

      return NextResponse.json({ message: "Deleted" });
    } catch (err:any) {
      console.log(err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
