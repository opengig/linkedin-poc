import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch all tracking URLs for the user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
    }

    const trackingUrls = await prisma.searchUrls.findMany({
      where: { userId: user.id },
      include: {
        trackPerson: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: trackingUrls });
  } catch (error) {
    console.error("Error fetching tracking URLs:", error);
    return NextResponse.json({ error: "Failed to fetch tracking URLs", success: false }, { status: 500 });
  }
}

// POST - Add a new tracking URL
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { title, url, trackPersonId } = await req.json();

    if (!title || !url || !trackPersonId) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
    }

    const trackingUrl = await prisma.searchUrls.create({
      data: {
        title,
        url,
        userId: user.id,
        trackPersonId,
      },
    });

    return NextResponse.json({
      success: true,
      data: trackingUrl,
    });
  } catch (error) {
    console.error("Error creating tracking URL:", error);
    return NextResponse.json({ error: "Failed to create tracking URL", success: false }, { status: 500 });
  }
}

// PUT - Update a tracking URL
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { id, title, url } = await req.json();

    if (!id || (!title && !url)) {
      return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
    }

    // Verify ownership
    const existingUrl = await prisma.searchUrls.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingUrl) {
      return NextResponse.json({ error: "Tracking URL not found or unauthorized", success: false }, { status: 404 });
    }

    const updatedUrl = await prisma.searchUrls.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(url && { url }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUrl,
    });
  } catch (error) {
    console.error("Error updating tracking URL:", error);
    return NextResponse.json({ error: "Failed to update tracking URL", success: false }, { status: 500 });
  }
}

// DELETE - Delete a tracking URL
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing URL ID", success: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
    }

    // Verify ownership
    const existingUrl = await prisma.searchUrls.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingUrl) {
      return NextResponse.json({ error: "Tracking URL not found or unauthorized", success: false }, { status: 404 });
    }

    await prisma.searchUrls.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Tracking URL deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tracking URL:", error);
    return NextResponse.json({ error: "Failed to delete tracking URL", success: false }, { status: 500 });
  }
}
