"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaLinkedin } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ConnectLinkedinPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  const steps = ["Fetching your profile data", "Syncing your jobs"];
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const sessionRef = useRef(session);
  const updateSessionRef = useRef(updateSession);
  const routerRef = useRef(router);

  useEffect(() => {
    sessionRef.current = session;
    updateSessionRef.current = updateSession;
    routerRef.current = router;
  }, [session, updateSession, router]);

  const getAuthLink = async () => {
    try {
      setIsConnecting(true);
      const { data } = await axios.get(`/api/linkedin/connect/auth?userId=${sessionRef.current?.user.id}`);
      if (data.success === false) {
        toast.error("Failed to connect with Linkedin");
      } else {
        const { url } = data.data;
        routerRef.current.push(url);
      }
    } catch (e) {
      toast.error("Failed to connect with Linkedin");
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      toast.loading("Checking connection status...", { duration: 3000 });
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Connection check complete");
      const { data } = await axios.get(`/api/linkedin/connect/status?userId=${sessionRef.current?.user.id}`);
      if (data.success) {
        if (data.isConnected) {
          toast.success("LinkedIn connected successfully");
          const currentSession = sessionRef.current;
          await updateSessionRef.current({
            ...currentSession!,
            user: {
              ...currentSession!.user,
              needsLinkedinConn: false,
              linkedinDetails: data.linkedinDetails,
            },
          });
          routerRef.current.push("/dashboard");
        } else if (data.duplicateAccount) {
          toast.error("Account already connected with another user", { duration: 5000 });
        }
      }
    } finally {
      setIsCheckingConnection(false);
    }
  };

  useEffect(() => {
    sessionRef.current = session;
    updateSessionRef.current = updateSession;
    routerRef.current = router;
    if (session?.user.id) {
      checkConnectionStatus();
    }
  }, [session?.user.id]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Connect LinkedIn</CardTitle>
          <CardDescription>Connect your LinkedIn account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FaLinkedin className="h-16 w-16 text-[#0A66C2]" />
            <p className="text-sm text-gray-500">Connect your LinkedIn account to access all features</p>
          </div>
          <LoadingButton
            onClick={getAuthLink}
            className="w-full bg-[#0A66C2] hover:bg-[#084482]"
            isLoading={isConnecting}
            disabled={isConnecting || isCheckingConnection}
          >
            <FaLinkedin className="mr-2 h-4 w-4" />
            Connect LinkedIn
          </LoadingButton>
          <LoadingButton className="w-full" onClick={() => signOut({ callbackUrl: "/auth/signin" })} variant="outline">
            Signout
          </LoadingButton>
        </CardContent>
      </Card>
    </div>
  );
}
