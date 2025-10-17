import ImageKit from "imagekit";
import { PrismaClient } from "@/lib/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const hasImagekit = Boolean(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_URL_ENDPOINT);
let imagekit: any = null;
if (hasImagekit) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });
}

const prisma = new PrismaClient();
const FOLDER = "/projects/SmartSatTV/catalogApps";

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

async function resolveFileId({ fileId, imageUrl }: { fileId?: string | null; imageUrl?: string | null }) {
  if (fileId) return fileId;
  if (!imageUrl) return null;
  if (!hasImagekit) return null;
  const name = fileNameFromUrl(imageUrl);
  if (!name) return null;
  const found = await imagekit.listFiles({ path: FOLDER.replace(/^\//, ""), name, limit: 1 });
  if (found && found.length) {
    const file = found[0];
    if ("fileId" in file) return file.fileId;
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = (formData.get("fileName") as string) || `app_${Date.now()}.png`;
    const fileData = await toBase64FromFormFile(file);

    if (hasImagekit && imagekit) {
      const uploadResponse = await imagekit.upload({ file: fileData, fileName, folder: FOLDER });
      return NextResponse.json({ message: "Uploaded successfully", imageUrl: uploadResponse.url, fileId: uploadResponse.fileId });
    }

    const dataUrl = `data:image/png;base64,${fileData}`;
    return NextResponse.json({ message: "Uploaded (fallback)", imageUrl: dataUrl, fileId: null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const appId = Number(formData.get("appId"));
    if (!Number.isFinite(appId)) return NextResponse.json({ error: "Invalid appId" }, { status: 400 });
    const file = formData.get("file");
    const fileName = (formData.get("fileName") as string) || `app_${appId}_${Date.now()}.png`;
    const oldFileId = (formData.get("oldFileId") as string) || undefined;
    const oldImageUrl = (formData.get("oldImageUrl") as string) || undefined;

    const fileData = await toBase64FromFormFile(file);
    if (hasImagekit && imagekit) {
      const uploadResponse = await imagekit.upload({ file: fileData, fileName, folder: FOLDER });
      try {
        const resolvedId = await resolveFileId({ fileId: oldFileId, imageUrl: oldImageUrl });
        if (resolvedId) await imagekit.deleteFile(resolvedId);
      } catch (err: any) {
        console.log(err);
      }

      return NextResponse.json({ message: "Image updated", imageUrl: uploadResponse.url, fileId: uploadResponse.fileId });
    }

    const dataUrl = `data:image/png;base64,${fileData}`;
    try {
      await prisma.catalogApp.update({ where: { id: appId }, data: { image: dataUrl } });
    } catch (_) {}
    return NextResponse.json({ message: "Image updated (fallback)", imageUrl: dataUrl, fileId: null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("appId");
    const body = await request.json().catch(() => null);
    const appId = Number(idParam || (body && body.appId));
    const fileId = (url.searchParams.get("fileId") || (body && body.fileId)) as string | undefined;
    const imageUrl = (url.searchParams.get("imageUrl") || (body && body.imageUrl)) as string | undefined;

    let toDeleteId: string | null = null;
    if (fileId) toDeleteId = fileId;

    let appImageUrl: string | null = null;
    if (Number.isFinite(appId)) {
      try {
        const app = await prisma.catalogApp.findUnique({ where: { id: appId } });
        appImageUrl = app?.image || null;
      } catch (_) {}
    }

    if (hasImagekit && imagekit) {
      const resolvedId = await resolveFileId({ fileId: toDeleteId || undefined, imageUrl: imageUrl || appImageUrl || undefined });
      if (resolvedId) await imagekit.deleteFile(resolvedId);

      if (Number.isFinite(appId)) {
        await prisma.catalogApp.update({ where: { id: appId }, data: { image: "" } });
      }

      return NextResponse.json({ message: "Image deleted" });
    }

    try {
      if (Number.isFinite(appId)) {
        await prisma.catalogApp.update({ where: { id: appId }, data: { image: "" } });
        return NextResponse.json({ message: "Image deleted (db)" });
      }
    } catch (error: any) {
      return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
    }

    return NextResponse.json({ message: "Nothing deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? String(error) }, { status: 500 });
  }
}
