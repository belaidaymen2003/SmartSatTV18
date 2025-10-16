"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/catalog/demonstrationvideo"); }, [router]);
  return <div className="text-white">Redirecting…</div>;
}
