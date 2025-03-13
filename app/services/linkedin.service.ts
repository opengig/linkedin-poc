import client, { UNIPINE_BASE_URL } from "@/lib/unipile";
import axios from "axios";

export class LinkedinService {
  static async withdrawRequest(invitationId: string, accountId: string) {
    try {
      console.log(`Withdrawing request for ${invitationId}`);
      const resp = await client.users.cancelInvitationSent({
        account_id: accountId,
        invitation_id: invitationId,
      });
      return resp.object === "InvitationCanceled";
    } catch (error) {
      console.error(`Error withdrawing request: ${error}`);
      return false;
    }
  }

  static async checkIfInvitationAccepted(linkedinId: string, accountId: string) {
    try {
      const resp: any = await client.users.getProfile({
        account_id: accountId,
        identifier: linkedinId,
      });
      const networkDistance = resp.network_distance as string;
      return networkDistance.includes("1st") || networkDistance.includes("FIRST");
    } catch (error) {
      console.error(`Error checking if invitation is accepted: ${error}`);
      return false;
    }
  }

  static async sendConnectionRequest(data: any, accountId: string) {
    const results: any[] = [];
    try {
      for (const item of data) {
        const { linkedinId, message } = item;
        try {
          console.log(`Sending invitation to ${linkedinId}`);
          const profile: any = await client.users.getProfile({
            account_id: accountId,
            identifier: linkedinId,
          });
          const providerId = profile.provider_id;
          const resp = await client.users.sendInvitation({
            account_id: accountId,
            provider_id: providerId,
            message,
          });
          if (resp.invitation_id) {
            console.log(`Invitation sent to ${linkedinId}`);
            results.push({
              linkedinId,
              success: true,
              invitationId: resp.invitation_id,
            });
          } else {
            console.error(`Invitation failed to send to ${linkedinId}`);
            results.push({ linkedinId, success: false });
          }
        } catch (error) {
          console.error(`Error sending invitation to ${linkedinId}: ${error}`);
          results.push({ linkedinId: item.linkedinId, success: false });
        }
      }
      return results;
    } catch (error) {
      console.error(`Error sending invitations: ${error}`);
      return data.map((item: any) => ({
        linkedinId: item.linkedinId,
        success: false,
      }));
    }
  }

  static async getBasicUserProfile(linkedinId: string, accountId: string, ownProfile?: boolean) {
    const resp: any = await client.users.getProfile({
      account_id: accountId,
      identifier: linkedinId,
    });
    return resp;
  }

  static async getUserProfile(linkedinId: string, accountId: string) {
    const resp: any = await client.users.getProfile({
      account_id: accountId,
      identifier: linkedinId,
      linkedin_sections: "*",
    });
    return resp;
  }

  static async getUserExperience(linkedinId: string, accountId: string) {
    const resp: any = await client.users.getProfile({
      account_id: accountId,
      identifier: linkedinId,
      linkedin_sections: "experience",
    });
    return resp;
  }

  static async getUserEducation(linkedinId: string, accountId: string) {
    const resp: any = await client.users.getProfile({
      account_id: accountId,
      identifier: linkedinId,
      linkedin_sections: "education",
    });
    return resp;
  }

  static async searchPeopleLinkedin(accountId: string, keywords: string, limit: number = 10) {
    try {
      console.log(`Searching people on LinkedIn for ${keywords}`);
      const peopleUrl = `https://www.linkedin.com/search/results/people/?keywords=${keywords}&origin=FACETED_SEARCH`;
      const url = `${UNIPINE_BASE_URL}/api/v1/linkedin/search?account_id=${accountId}`;

      const { data } = await axios.post(
        url,
        { url: peopleUrl },
        {
          headers: {
            "X-API-KEY": process.env.NEXT_UNIPILE_ACCESS_TOKEN,
          },
        }
      );
      console.log(`Fetched ${data?.items?.length} people for ${keywords}`);
      return data.items.slice(0, limit);
    } catch (error) {
      console.error(`Error searching people on LinkedIn: ${error}`);
      return [];
    }
  }
}
