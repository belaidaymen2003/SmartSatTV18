import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

function parseNumber(v: string | null, fallback = undefined) {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const appId = Number(id);
      if (!Number.isFinite(appId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      const app = await prisma.catalogApp.findUnique({ where: { id: appId } });
      if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ app });
    }

    const q = (searchParams.get("q") || "").trim();
    const version = (searchParams.get("version") || "").trim();
    const minCredit = parseNumber(searchParams.get("minCredit"), undefined);
    const maxCredit = parseNumber(searchParams.get("maxCredit"), undefined);
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 12)));

    const and: any[] = [];
    if (q) and.push({ name: { contains: q, mode: "insensitive" } });
    if (version) and.push({ version: { contains: version, mode: "insensitive" } });
    if (typeof minCredit === "number") and.push({ credit: { gte: minCredit } });
    if (typeof maxCredit === "number") and.push({ credit: { lte: maxCredit } });
    if (createdFrom) and.push({ createdAt: { gte: new Date(createdFrom) } });
    if (createdTo) and.push({ createdAt: { lte: new Date(createdTo) } });

    const where = and.length ? { AND: and } : {};

    try {
      const [total, apps] = await Promise.all([
        prisma.catalogApp.count({ where }),
        prisma.catalogApp.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return NextResponse.json({ apps, total, page, pageSize });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, downloadLink, image, credit, version } = body || {};
    if (!name || !downloadLink) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    try {
      const created = await prisma.catalogApp.create({
        data: {
          name: String(name),
          description: description ? String(description) : "",
          downloadLink: String(downloadLink),
          image: image ? String(image) : "",
          credit: typeof credit === "number" ? credit : Number(credit) || 0,
          version: version ? String(version) : "",
        },
      });
      return NextResponse.json({ message: "Created", app: created }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, downloadLink, image, credit, version } = body || {};
    const appId = Number(id);
    if (!appId || !Number.isFinite(appId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    try {
      const updated = await prisma.catalogApp.update({
        where: { id: appId },
        data: {
          name: name ? String(name) : undefined,
          description: typeof description !== "undefined" ? String(description) : undefined,
          downloadLink: downloadLink ? String(downloadLink) : undefined,
          image: typeof image !== "undefined" ? String(image) : undefined,
          credit: typeof credit !== "undefined" ? Number(credit) : undefined,
          version: typeof version !== "undefined" ? String(version) : undefined,
        },
      });
      return NextResponse.json({ message: "Updated", app: updated });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const appId = Number(idParam);
    if (!appId || !Number.isFinite(appId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    try {
      await prisma.catalogApp.delete({ where: { id: appId } });
      return NextResponse.json({ message: "Deleted" });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}
