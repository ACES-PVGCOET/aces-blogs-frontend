import { NextRequest, NextResponse } from "next/server";
import { mockBlogs } from "@/lib/mock-data";
import { Blog } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  let result = [...mockBlogs];

  if (category) {
    result = result.filter(
      (b) => b.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (status && status !== "ALL") {
    result = result.filter((b) => b.status === status);
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newBlog: Blog = {
      id: "blog-" + Date.now(),
      slug:
        body.slug ||
        (body.title || "new-dispatch")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      title: body.title || "Untitled Dispatch",
      thumbnail:
        body.thumbnail ||
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      author: body.author || "writer-101",
      authorName: body.authorName || "Aarav Sharma",
      authorHandle: body.authorHandle || "@aarav_writes",
      authorAvatar:
        body.authorAvatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      reviewer: body.reviewer || null,
      status: body.status || "DRAFT",
      category: body.category || "General",
      tags: Array.isArray(body.tags) ? body.tags : ["systems"],
      readTime: body.readTime || "5 min read",
      readsCount: 0,
      content: body.content || "",
      excerpt: body.excerpt || body.title || "",
      latestRevisionVersion: 1,
      latestPublishedVersion: body.status === "PUBLISHED" ? 1 : 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    return NextResponse.json(newBlog, { status: 201 });
  } catch (err) {
    console.error("[POST /api/blogs]", err);
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }
}
