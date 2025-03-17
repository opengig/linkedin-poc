import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { LinkedinService } from "@/app/services/linkedin.service";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const trackedProfiles = await prisma.trackPerson.findMany({
      where: {
        addedBy: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({
      success: true,
      data: trackedProfiles,
    });
  } catch (error) {
    console.error("Error fetching tracked profiles:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tracked profiles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "LinkedIn username is required", success: false });
    }

    const existingProfile = await prisma.trackPerson.findUnique({
      where: { addedBy_username: { username, addedBy: session.user.id } },
    });

    if (existingProfile) {
      return NextResponse.json({ error: "Profile is already being tracked", success: false });
    }

    const linkedinDetails = await prisma.linkedinDetails.findUnique({
      where: { userId: session.user.id },
    });

    if (!linkedinDetails?.accountId) {
      return NextResponse.json({ error: "LinkedIn account not connected", success: false });
    }

    const profile = await LinkedinService.getBasicUserProfile(username, linkedinDetails.accountId);

    if (!profile) {
      return NextResponse.json({ error: "LinkedIn profile not found", success: false });
    }

    const trackedProfile = await prisma.trackPerson.create({
      data: {
        addedBy: session.user.id,
        username: username,
        name: (profile.first_name || "") + " " + (profile.last_name || ""),
        avatar: profile.profile_picture_url,
        title: profile.headline || "",
        location: profile.location || "",
        profileUrl: profile.public_profile_url || `https://www.linkedin.com/in/${username}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: trackedProfile,
    });
  } catch (error) {
    console.error("Error adding tracked profile:", error);
    return NextResponse.json({ success: false, error: "Failed to add tracked profile" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required", success: false }, { status: 400 });
    }

    const profile = await prisma.trackPerson.findFirst({
      where: {
        id,
        addedBy: session.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found", success: false }, { status: 404 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.connection.deleteMany({
        where: { trackPersonId: id },
      });
      await tx.searchUrls.deleteMany({
        where: { trackPersonId: id },
      });
      await tx.trackPerson.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting tracked profile:", error);
    return NextResponse.json({ success: false, error: "Failed to delete tracked profile" }, { status: 500 });
  }
}
