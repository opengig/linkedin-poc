import { NextRequest, NextResponse } from "next/server";
import { LinkedinService } from "@/app/services/linkedin.service";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { UserService } from "@/app/services";
import prisma from "@/lib/db";

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
