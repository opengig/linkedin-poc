// types/next-auth.d.ts

import NextAuth, { DefaultUser } from "next-auth";
import { User as NextAuthUser } from "next-auth";
declare module "next-auth" {
  interface User extends DefaultUser {
    needsLinkedinConn?: boolean;
    linkedinDetails?: {
      email?: string;
      avatar?: string;
      name?: string;
      headline?: string;
      jobsLastSyncedAt?: string | Date;
      username?: string;
      accountId?: string;
      isPremium?: boolean;
    };
  }

  interface Session {
    user: {
      id?: string;
      email?: string;
      name?: string;
      linkedinDetails?: {
        email?: string;
        avatar?: string;
        name?: string;
        headline?: string;
        jobsLastSyncedAt?: string | Date;
        username?: string;
        accountId?: string;
        isPremium?: boolean;
      };
      needsLinkedinConn?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    needsLinkedinConn?: boolean;
    linkedinDetails?: {
      email?: string;
      avatar?: string;
      name?: string;
      headline?: string;
      jobsLastSyncedAt?: string | Date;
      username?: string;
      accountId?: string;
      isPremium?: boolean;
    };
  }
}
