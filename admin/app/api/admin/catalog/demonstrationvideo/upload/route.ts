import ImageKit from "imagekit";
import { PrismaClient } from "@/lib/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

const hasImagekit = Boolean(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_URL_ENDPOINT);
let imagekit: any = null;
if (hasImagekit) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });
}

const FOLDER = "/projects/SmartSatTV/demonstrationVideos";

async function toBase64FromFormFile(file: FormDataEntryValue | null): Promise<string> {
  if (!file) throw new Error("No file provided");
  if (file instanceof Blob) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return buffer.toString("base64");
  }
  return file.toString();
}

function fileNameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

async function resolveFileId({ fileId, url }: { fileId?: string | null; url?: string | null }) {
  if (fileId) return fileId;
  if (!url) return null;
  if (!hasImagekit) return null;
  const name = fileNameFromUrl(url);
  if (!name) return null;
  const found = await imagekit.listFiles({ path: FOLDER.replace(/^\//, ""), name, limit: 1 });
  if (found && found.length) {
    const file = found[0];
    if ("fileId" in file) return (file as any).fileId;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = (formData.get("fileName") as string) || `video_${Date.now()}.mp4`;
    const mime = (formData.get("mime") as string) || "video/mp4";
    const fileData = await toBase64FromFormFile(file);

    if (hasImagekit && imagekit) {
      const uploadResponse = await imagekit.upload({ file: fileData, fileName, folder: FOLDER });
      return NextResponse.json({ message: "Uploaded successfully", videoUrl: uploadResponse.url, fileId: uploadResponse.fileId });
    }

    const dataUrl = `data:${mime};base64,${fileData}`;
    return NextResponse.json({ message: "Uploaded (fallback)", videoUrl: dataUrl, fileId: null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const file = formData.get("file");
    const fileName = (formData.get("fileName") as string) || `video_${id}_${Date.now()}.mp4`;
    const oldFileId = (formData.get("oldFileId") as string) || undefined;
    const oldUrl = (formData.get("oldUrl") as string) || undefined;
    const mime = (formData.get("mime") as string) || "video/mp4";

    const fileData = await toBase64FromFormFile(file);

    if (hasImagekit && imagekit) {
      const uploadResponse = await imagekit.upload({ file: fileData, fileName, folder: FOLDER });
      try {
        const resolvedId = await resolveFileId({ fileId: oldFileId, url: oldUrl });
        if (resolvedId) await imagekit.deleteFile(resolvedId);
      } catch (_) {}

      // also update DB
      try {
        await prisma.video.update({ where: { id }, data: { videoUrl: uploadResponse.url } });
      } catch (_) {}

      return NextResponse.json({ message: "Video updated", videoUrl: uploadResponse.url, fileId: uploadResponse.fileId });
    }

    const dataUrl = `data:${mime};base64,${fileData}`;
    try { await prisma.video.update({ where: { id }, data: { videoUrl: dataUrl } }); } catch (_) {}
    return NextResponse.json({ message: "Video updated (fallback)", videoUrl: dataUrl, fileId: null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const body = await request.json().catch(() => null);
    const id = Number(idParam || (body && (body as any).id));
    const fileId = (url.searchParams.get("fileId") || (body && (body as any).fileId)) as string | undefined;
    const oldUrl = (url.searchParams.get("url") || (body && (body as any).url)) as string | undefined;

    if (hasImagekit && imagekit) {
      const resolvedId = await resolveFileId({ fileId, url: oldUrl });
      if (resolvedId) await imagekit.deleteFile(resolvedId);
      try { if (Number.isFinite(id)) await prisma.video.update({ where: { id }, data: { videoUrl: null as any } }); } catch (_) {}
      return NextResponse.json({ message: "Video deleted" });
    }

    try {
      if (Number.isFinite(id)) await prisma.video.update({ where: { id }, data: { videoUrl: null as any } });
    } catch (error: any) {
      return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
    }
    return NextResponse.json({ message: "Video cleared" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}
