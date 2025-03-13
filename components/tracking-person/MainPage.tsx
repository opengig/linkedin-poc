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
    toast.success("Syncing...");
    await fetchUrls();
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchUrls();
    }
  }, [session?.user.id]);

  return (
    <div>
      <Header onAddUrl={() => setShowAddForm(true)} onSync={handleSync} person={person} />
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
