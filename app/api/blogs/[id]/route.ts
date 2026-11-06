import { NextRequest, NextResponse } from "next/server";
import { mockBlogs } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const blog = mockBlogs.find((b) => b.id === decoded || b.slug === decoded);

  if (!blog) {
    return NextResponse.json({ error: "Dispatch not found" }, { status: 404 });
  }

  return NextResponse.json(blog, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const blog = mockBlogs.find((b) => b.id === decoded || b.slug === decoded);

  if (!blog) {
    return NextResponse.json({ error: "Dispatch not found" }, { status: 404 });
  }

  try {
    const updates = await req.json();
    const updated = {
      ...blog,
      ...updates,
      modifiedAt: new Date().toISOString(),
    };
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
