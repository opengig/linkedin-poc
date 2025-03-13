import prisma from "@/lib/db";
import client from "@/lib/unipile";

export class UserService {
  static async checkForAccountConflict(email: string, userId: string) {
    try {
      const existingUser = await prisma.linkedinDetails.findFirst({
        where: { email },
      });
      if (existingUser && existingUser.userId !== userId) {
        console.info(
          `Email ${email} already linked to another account (userId: ${existingUser.userId} email: ${existingUser.email})`
        );
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Error checking linkedin details - ${e}`);
      throw new Error(`Error checking linkedin details - ${e}`);
    }
  }

  static async checkForAccountConflictAndDelete(email: string, userId: string, username: string) {
    try {
      const existingUser = await prisma.linkedinDetails.findMany({
        where: { OR: [{ email }, { username }] },
      });
      if (existingUser.length > 1) {
        console.info(`Email ${email} already linked to another account (userId: ${userId} email: ${email})`);
        const acc = await prisma.linkedinDetails.findUnique({
          where: {
            userId: userId,
          },
        });
        await prisma.linkedinDetails.delete({
          where: {
            userId: userId,
          },
        });
        await client.account.delete(acc?.accountId!);
        console.info(`Deleted account with userId: ${userId}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Error checking linkedin details - ${e}`);
      throw new Error(`Error checking linkedin details - ${e}`);
    }
  }

  static async saveLinkedinDetails(userId: string, account_id: string, userProfile: any) {
    try {
      const linkedinDetails = await prisma.linkedinDetails.upsert({
        where: {
          userId,
        },
        update: {
          accountId: account_id,
        },
        create: {
          accountId: account_id,
          userId,
          email: userProfile.email,
          name: userProfile.name,
          username: userProfile.username,
          avatar: userProfile.avatar,
          headline: userProfile.headline,
          isPremium: userProfile.isPremium,
        },
      });
      return linkedinDetails;
    } catch (e) {
      console.error(`Error saving linkedin details for user ${userId} - ${e}`);
      throw new Error(`Error saving linkedin details for user ${userId} - ${e}`);
    }
  }

  static async checkForLinkedinDetails(userId: string) {
    try {
      const linkedinDetails = await prisma.linkedinDetails.findUnique({
        where: {
          userId,
        },
      });

      return linkedinDetails;
    } catch (e) {
      console.error(`Error checking linkedin details for user ${userId} - ${e}`);
      throw new Error(`Error checking linkedin details for user ${userId} - ${e}`);
    }
  }

  static async getLinkedinProfile(accountId: string) {
    try {
      const resp: any = await client.users.getOwnProfile(accountId);
      if (resp) {
        return {
          name: resp.first_name + " " + resp.last_name,
          email: resp.email,
          username: resp.public_identifier,
          headline: resp.occupation,
          avatar: resp.profile_picture_url,
          isPremium: resp.premium,
        };
      }
      return null;
    } catch (e) {
      console.error(`Error getting linkedin profile for account ${accountId} - ${e}`);
      return null;
    }
  }

  static async getLinkedinDetails(userId: string) {
    try {
      const resp = await prisma.linkedinDetails.findUnique({
        where: {
          userId,
        },
      });
      if (resp) {
        return {
          name: resp.name,
          email: resp.email,
          username: resp.username,
          headline: resp.headline,
          avatar: resp.avatar,
          accountId: resp.accountId,
          isPremium: resp.isPremium,
        };
      }
      return null;
    } catch (e) {
      console.error(`Error getting linkedin details for user ${userId} - ${e}`);
      return null;
    }
  }

  static async getAccountId(userId: string) {
    try {
      const linkedinDetails = await prisma.linkedinDetails.findUnique({
        where: {
          userId,
        },
      });
      return linkedinDetails?.accountId;
    } catch (e) {
      console.error(`Error getting account id for user ${userId} - ${e}`);
      return null;
    }
  }
}
