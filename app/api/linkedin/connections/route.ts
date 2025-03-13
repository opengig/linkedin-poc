import { NextRequest, NextResponse } from "next/server";
import { LinkedinService } from "@/app/services/linkedin.service";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { UserService } from "@/app/services";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false });
    }

    const { searchParams } = new URL(request.url);
    const syncDate = searchParams.get("syncDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const trackPersonId = searchParams.get("trackPersonId");

    if (!trackPersonId) {
      return NextResponse.json({ error: "Track person ID is required", success: false });
    }

    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json({
        error: "Invalid pagination parameters",
        success: false,
      });
    }

    // Build where clause
    const whereClause: any = {
      userId: session.user.id,
      trackPersonId: trackPersonId,
    };

    if (syncDate) {
      const parsedDate = new Date(syncDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({
          error: "Invalid sync date format",
          success: false,
        });
      }
      whereClause.syncedAt = parsedDate;
    }

    // Get unique sync dates
    const uniqueSyncDates = await prisma.connection.findMany({
      where: {
        userId: session.user.id,
        trackPersonId: trackPersonId || "",
      },
      distinct: ["syncedAt"],
      select: {
        syncedAt: true,
      },
      orderBy: {
        syncedAt: "desc",
      },
    });

    // Get total count for pagination
    const totalConnections = await prisma.connection.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalConnections / limit);

    // Fetch paginated connections
    const connections = await prisma.connection.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        syncedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        connections,
        syncDates: uniqueSyncDates.map((date) => date.syncedAt),
        pagination: {
          total: totalConnections,
          currentPage: page,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Internal server error",
      success: false,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { trackPersonId, userId } = await request.json();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized", success: false });
    }
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized", success: false });
    }
    const linkedinDetails = await UserService.getLinkedinDetails(userId);
    if (!linkedinDetails || !linkedinDetails.accountId) {
      return NextResponse.json({ error: "LinkedIn details not found", success: false });
    }
    const searchUrls = await prisma.searchUrls.findMany({
      where: {
        userId: userId,
        trackPersonId: trackPersonId,
      },
    });

    const searchUrlsArray = searchUrls.map((searchUrl) => searchUrl.url);

    await LinkedinService.syncConnections(searchUrlsArray, linkedinDetails.accountId, userId, trackPersonId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error", success: false });
  }
}
