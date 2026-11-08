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

    // Ensure content is stored in JSON format for the database
    let contentString = "";
    if (typeof body.content === "string") {
      contentString = body.content;
    } else if (body.content && typeof body.content === "object") {
      contentString = JSON.stringify(body.content);
    } else if (body.contentJson) {
      contentString = JSON.stringify(body.contentJson);
    }

    const newBlog: Blog = {
      id: "blog-" + Date.now(),
      slug:
        body.slug ||
        (body.title || "new-dispatch")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      title: body.title || "Untitled Dispatch",
      thumbnail: body.thumbnail || "",
      author: body.author || "contributor",
      authorName: body.authorName || "ACES Contributor",
      authorHandle: body.authorHandle || "@aces_contributor",
      authorAvatar: body.authorAvatar || "",
      reviewer: body.reviewer || null,
      status: body.status || "DRAFT",
      category: body.category || "General",
      tags: Array.isArray(body.tags) ? body.tags : ["systems"],
      readTime: body.readTime || "5 min read",
      readsCount: 0,
      content: contentString || "{}",
      contentJson: body.contentJson || (contentString.startsWith("{") ? JSON.parse(contentString) : null),
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
