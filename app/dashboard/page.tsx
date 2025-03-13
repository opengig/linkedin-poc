"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { FaLinkedin, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import Link from "next/link";
interface TrackedProfile {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string | null;
  profileUrl: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<TrackedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user.id) {
      fetchProfiles();
    }
  }, [session?.user.id]);

  const fetchProfiles = async () => {
    try {
      const { data } = await axios.get("/api/linkedin/tracked");
      if (!data.success) throw new Error("Failed to fetch profiles");
      setProfiles(data.data);
    } catch (error) {
      toast.error("Error fetching profiles");
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAdding(true);

    try {
      const usernameToTrack = username.includes("linkedin.com/in/")
        ? username.split("linkedin.com/in/")[1].split("/")[0]
        : username;

      const { data } = await axios.post("/api/linkedin/tracked", {
        username: usernameToTrack,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to add profile");
      }
      toast.success("Profile added successfully");
      setUsername("");
      setShowAddForm(false);
      fetchProfiles();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data } = await axios.delete(`/api/linkedin/tracked?id=${id}`);

      if (!data.success) {
        throw new Error("Failed to delete profile");
      }
      toast.success("Profile deleted successfully");
      setProfiles(profiles.filter((profile) => profile.id !== id));
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Tracked Profiles</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <FaPlus className="h-4 w-4" />
          Add Profile
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add LinkedIn Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProfile} className="space-y-4">
              <div>
                <Input
                  placeholder="Enter LinkedIn username or profile URL"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex gap-5 justify-center">
                <LoadingButton type="submit" isLoading={isAdding}>
                  Add Profile
                </LoadingButton>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setError("");
                    setUsername("");
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No profiles tracked yet. Click the Add Profile button to start tracking LinkedIn profiles.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-full" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaLinkedin className="text-gray-400 text-xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <Link
                      href={profile.profileUrl}
                      target="_blank"
                      className="text-lg font-semibold text-gray-900 truncate hover:underline"
                    >
                      {profile.name}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{profile.title}</p>
                    <p className="text-sm text-gray-500 truncate">{profile.location}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2 justify-end">
                  <Trash
                    size={16}
                    className="hover:text-red-500 text-gray-500 cursor-pointer"
                    onClick={() => handleDelete(profile.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
