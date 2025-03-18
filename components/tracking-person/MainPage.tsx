"use client";

import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import NewUrlForm from "./NewUrlForm";
import SearchUrls from "./SearchUrls";
import ConnectionsTable from "./ConnectionsTable";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface ConnectionsTableRef {
  fetchConnections: () => Promise<void>;
}

const MainPage = ({ person }: { person: any }) => {
  const connectionsTableRef = useRef<ConnectionsTableRef>(null);
  const { data: session } = useSession();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingUrlIds, setSyncingUrlIds] = useState<string[]>([]);

  const [urls, setUrls] = useState<any[]>([]);

  const fetchUrls = async () => {
    try {
      const { data } = await axios.get(`/api/tracking-urls?trackPersonId=${person.id}`);
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

  const handleSyncingStates = (state: boolean, urlId?: string) => {
    if (urlId) {
      if (state) {
        setSyncingUrlIds((prev) => [...prev, urlId]);
      } else {
        setSyncingUrlIds((prev) => prev.filter((id) => id !== urlId));
      }
    } else {
      setIsSyncing(state);
    }
  };

  const handleSync = async (searchUrlId?: string) => {
    try {
      handleSyncingStates(true, searchUrlId);
      const { data } = await axios.post("/api/linkedin/connections", {
        trackPersonId: person.id,
        userId: session?.user.id,
        ...(searchUrlId && { searchUrlId }),
      });
      if (data.success) {
        toast.success("Synced successfully");
        connectionsTableRef.current?.fetchConnections();
      } else {
        toast.error("Failed to sync");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Failed to sync");
    } finally {
      handleSyncingStates(false, searchUrlId);
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
      <SearchUrls urls={urls} fetchUrls={fetchUrls} onSync={handleSync} syncingUrlIds={syncingUrlIds} />
      <div className="mt-8">
        <ConnectionsTable ref={connectionsTableRef} />
      </div>
    </div>
  );
};

export default MainPage;
