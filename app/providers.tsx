"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <TooltipProvider>
        {children}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 2500,
            style: {
              maxWidth: "600px",
              backgroundColor: "#333",
              color: "#fff",
            },
          }}
        />
      </TooltipProvider>
    </SessionProvider>
  );
};

export default Providers;
