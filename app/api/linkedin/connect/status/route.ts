import { UserService } from "@/app/services";
import { NextResponse } from "next/server";

export const GET = async (req: Request, res: NextResponse) => {
  /// get userId from query params
  const searchParams = new URLSearchParams(req.url.split("?")[1]);
  const userId = searchParams.get("userId");
  try {
    console.info(`Checking connection for user ${userId}`);

    if (!userId) {
      console.error("UserId is required");
      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          message: "User id is required",
        },
        { status: 400 }
      );
    }

    const resp = await UserService.checkForLinkedinDetails(userId);
    if (resp) {
      const { email, username } = resp;
      const isAcccountConflicted = await UserService.checkForAccountConflictAndDelete(email, userId, username || "");

      if (isAcccountConflicted) {
        return NextResponse.json(
          {
            success: true,
            status: "SUCCESS",
            isConnected: false,
            duplicateAccount: true,
          },
          { status: 200 }
        );
      }
      const linkedinDetails = await UserService.getLinkedinProfile(resp.accountId || "");
      return NextResponse.json(
        {
          success: true,
          status: "SUCCESS",
          accountId: resp.accountId,
          linkedinDetails: linkedinDetails,
          isConnected: true,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        status: "SUCCESS",
        isConnected: false,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(`Error finding linkedin details for user ${userId}`);
    return NextResponse.json({
      success: false,
      status: "FAILED",
    });
  }
};
