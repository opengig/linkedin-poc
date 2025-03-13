import { UserService } from "@/app/services";
import client, { UNIPINE_BASE_URL } from "@/lib/unipile";
import { NextResponse } from "next/server";

const notify_url =
  process.env.NODE_ENV === "development"
    ? "https://b39c-2401-4900-1cb5-d420-fc03-b5b1-1feb-e89.ngrok-free.app/api/linkedin/connect/auth"
    : `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/connect/auth`;

export const GET = async (req: Request, res: NextResponse) => {
  try {
    /// get userId from query params
    const searchParams = new URLSearchParams(req.url.split("?")[1]);
    const userId = searchParams.get("userId");

    console.log(`Creating hosted auth link for user ${userId}`);

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

    const resp = await client.account.createHostedAuthLink(
      {
        type: "create",
        api_url: UNIPINE_BASE_URL,
        expiresOn: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        providers: ["LINKEDIN"],
        name: userId || "",
        notify_url: notify_url,
        success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/connect-linkedin`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/connect-linkedin`,
      },
      {
        extra_params: {
          disabled_options: ["proxy", "cookie_auth", "sync_limit"] as any,
          bypass_success_screen: true as any,
          success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/connect-linkedin`,
          failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/connect-linkedin`,
        },
      }
    );
    return NextResponse.json(
      {
        success: true,
        status: "SUCCESS",
        data: resp,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        success: false,
        status: "FAILED",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request, res: NextResponse) => {
  try {
    console.info("Account connected successfully, saving to database");
    const { account_id, name } = await req.json();
    console.debug(`Account ID: ${account_id}, Name: ${name}`);

    const userProfile = await UserService.getLinkedinProfile(account_id);

    const linkedinDetails = await UserService.saveLinkedinDetails(name, account_id, userProfile);

    return NextResponse.json(
      {
        success: true,
        status: "SUCCESS",
        data: linkedinDetails,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        success: false,
        status: "FAILED",
      },
      { status: 500 }
    );
  }
};
