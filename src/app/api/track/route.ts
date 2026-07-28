import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteVisits } from "@/db/schema";
import { newId } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: string };
    const path = (body.path ?? "/").slice(0, 200);
    if (path.startsWith("/admin")) return NextResponse.json({ ok: true });
    await db.insert(siteVisits).values({ id: newId(), path });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
