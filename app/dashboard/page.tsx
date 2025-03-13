"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <div className="text-sm">
            <p>Welcome, {session?.user?.name || "User"}!</p>
            <p>Email: {session?.user?.email}</p>
          </div>
          <LoadingButton onClick={handleSignOut} variant="outline" className="w-full" isLoading={isLoading}>
            Sign Out
          </LoadingButton>
        </CardContent>
      </Card>
    </div>
  );
}
