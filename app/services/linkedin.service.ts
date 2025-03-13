import client, { UNIPINE_BASE_URL } from "@/lib/unipile";
import axios from "axios";
import prisma from "@/lib/db";

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

  static async fetchConnections({
    accountId,
    searchUrl,
    page = 1,
    cursor,
    limit = 50,
  }: {
    accountId: string;
    searchUrl: string;
    page: number;
    cursor: string;
    limit: number;
  }) {
    try {
      console.log(`Fetching connections for ${searchUrl} on page ${page}`);
      const url = cursor
        ? `${UNIPINE_BASE_URL}/api/v1/linkedin/search?account_id=${accountId}&cursor=${cursor}&limit=${limit}`
        : `${UNIPINE_BASE_URL}/api/v1/linkedin/search?account_id=${accountId}&limit=${limit}`;

      const { data } = await axios.post(
        url,
        { url: searchUrl },
        {
          headers: {
            "X-API-KEY": process.env.NEXT_UNIPILE_ACCESS_TOKEN,
          },
        }
      );
      console.log(`Fetched ${data?.items?.length} connections for ${searchUrl} on page ${page}`);
      return { items: data.items, cursor: data.cursor };
    } catch (error: any) {
      console.error(`Error fetching connections for ${searchUrl} on page ${page}: ${error.message}`);
      console.log(error);
      return { items: [], cursor: null };
    }
  }

  static async syncConnections(searchUrls: string[], accountId: string, userId: string, trackPersonId: string) {
    try {
      console.log(`Syncing connections for ${searchUrls.length} search URLs`);
      const syncStartTime = new Date();
      let cursor = null;
      const connections = [];
      let totalConnections = 0;
      let index = 0;

      for (const searchUrl of searchUrls) {
        console.log(`Syncing connections for url no. ${index + 1} of ${searchUrls.length}`);
        let localTotalConnections = 0;
        do {
          const { items, cursor: nextCursor } = await this.fetchConnections({
            accountId,
            searchUrl,
            page: 1,
            cursor,
            limit: 50,
          });
          console.log(`Fetched ${items.length} connections for url no. ${index + 1} of ${searchUrls.length}`);
          if (items.length > 0) {
            const transformedConnections = items.map((item: any) => ({
              username: item.public_identifier,
              name: item.name,
              avatar: item.profile_picture_url,
              title: item.headline,
              location: item.location,
              insight: item?.insight || null,
              profileUrl: `https://www.linkedin.com/in/${item.public_identifier}`,
              degree: item.network_distance || "",
            }));

            connections.push(...transformedConnections);
          }

          localTotalConnections += items.length;
          cursor = nextCursor;
          const randomSleep = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
          await new Promise((resolve) => setTimeout(resolve, randomSleep));
        } while (cursor && localTotalConnections < 500);
        index++;
        const randomSleep = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
        await new Promise((resolve) => setTimeout(resolve, randomSleep));
      }

      if (connections.length > 0) {
        console.log(`Upserting ${connections.length} connections`);
        const batchSize = 100;
        for (let i = 0; i < connections.length; i += batchSize) {
          console.log(`Upserting batch no. ${i / batchSize + 1} of ${Math.ceil(connections.length / batchSize)}`);
          const batch = connections.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (connection) => {
              await prisma.connection.upsert({
                where: {
                  userId_trackPersonId_username: {
                    userId: userId,
                    trackPersonId: trackPersonId,
                    username: connection.username,
                  },
                },
                update: {
                  ...connection,
                  syncedAt: syncStartTime,
                },
                create: {
                  ...connection,
                  userId: userId,
                  trackPersonId: trackPersonId,
                  syncedAt: syncStartTime,
                },
              });
            })
          );
        }
      }

      console.log(`Successfully synced and upserted ${totalConnections} connections`);
      return {
        success: true,
        totalSynced: totalConnections,
        syncStartTime,
      };
    } catch (error) {
      console.error(`Error syncing connections: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }
}
