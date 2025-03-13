"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaLinkedin, FaCheckCircle } from "react-icons/fa";

interface LinkedInDetails {
  email?: string;
  name?: string;
  headline?: string;
  avatar?: string;
  username?: string;
  isPremium?: boolean;
}

interface User {
  id?: string;
  name?: string;
  email?: string;
  linkedinDetails?: LinkedInDetails;
  needsLinkedinConn?: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const linkedinDetails = session.user.linkedinDetails;
  const userEmail = session.user.email || "";
  const userName = session.user.name || "User";
  const userInitial = userName[0] || userEmail[0]?.toUpperCase() || "U";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6 max-w-2xl mx-auto">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">{userInitial}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{userName}</h2>
                  <p className="text-gray-500">{userEmail}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaLinkedin className="text-[#0A66C2]" />
              LinkedIn Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <p className="font-medium">
                {session.user.needsLinkedinConn ? (
                  <span className="text-red-600">Not Connected</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Connected
                  </span>
                )}
              </p>
            </div>

            {session.user.needsLinkedinConn ? (
              <div className="mt-4">
                <a href="/connect-linkedin" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Connect your LinkedIn account
                </a>
              </div>
            ) : (
              linkedinDetails && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      {linkedinDetails.avatar ? (
                        <img
                          src={linkedinDetails.avatar}
                          alt={linkedinDetails.name || ""}
                          className="h-16 w-16 rounded-full"
                        />
                      ) : (
                        <FaLinkedin className="text-2xl text-[#0A66C2]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{linkedinDetails.name}</h2>
                      <p className="text-gray-500">{linkedinDetails.headline}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Email:</strong> {linkedinDetails.email}
                    </p>
                    {linkedinDetails.username && (
                      <p>
                        <strong>Username:</strong> {linkedinDetails.username}
                      </p>
                    )}
                    <p>
                      <strong>Account Type:</strong> {linkedinDetails.isPremium ? "Premium" : "Basic"}
                    </p>
                  </div>
                  {linkedinDetails.username && (
                    <a
                      href={`https://linkedin.com/in/${linkedinDetails.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-800 hover:underline mt-2"
                    >
                      View LinkedIn Profile
                    </a>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
