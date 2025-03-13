"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaLinkedin } from "react-icons/fa";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: "/auth/signin" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p>Welcome, {session?.user?.name || "User"}!</p>
            <p>Email: {session?.user?.email}</p>
            <div className="flex items-center space-x-2">
              <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
              <p>
                LinkedIn Status:{" "}
                {session?.user?.needsLinkedinConn ? (
                  <span className="text-red-600">Not Connected</span>
                ) : (
                  <a href="/connect-linkedin" className="text-blue-500 hover:underline">
                    Connect LinkedIn
                  </a>
                )}
              </p>
            </div>
          </div>
          <LoadingButton onClick={handleSignOut} variant="outline" className="w-full" isLoading={isLoading}>
            Sign Out
          </LoadingButton>
        </CardContent>
      </Card>
    </div>
  );
}
