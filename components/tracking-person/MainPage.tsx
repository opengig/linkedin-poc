"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import Header from "./Header";
import NewUrlForm from "./NewUrlForm";
import SearchUrls from "./SearchUrls";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const MainPage = ({ person }: { person: any }) => {
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [urls, setUrls] = useState<any[]>([]);

  const fetchUrls = async () => {
    try {
      const { data } = await axios.get("/api/tracking-urls");
      if (data.success) {
        setUrls(data.data);
      } else {
        toast.error("Failed to fetch URLs");
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to fetch URLs");
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const { data } = await axios.post("/api/linkedin/connections", {
        trackPersonId: person.id,
        userId: session?.user.id,
      });
      if (data.success) {
        toast.success("Synced successfully");
      } else {
        toast.error("Failed to sync");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Failed to sync");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchUrls();
    }
  }, [session?.user.id]);

  return (
    <div>
      <Header onAddUrl={() => setShowAddForm(true)} onSync={handleSync} person={person} isSyncing={isSyncing} />
      <NewUrlForm
        fetchUrls={fetchUrls}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        trackPersonId={person.id}
      />
      <SearchUrls urls={urls} fetchUrls={fetchUrls} />
    </div>
  );
};

export default MainPage;
