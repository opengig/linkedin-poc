"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaHome } from "react-icons/fa";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: FaHome,
      active: pathname.startsWith("/dashboard"),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: FaUser,
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              LinkedIn Tracker
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  item.active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <p onClick={() => signOut()} className="text-sm text-gray-500 cursor-pointer">
              Sign Out
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
