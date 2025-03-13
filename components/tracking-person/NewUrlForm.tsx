"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { LoadingButton } from "../ui/loading-button";
import { Button } from "../ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";

interface NewUrlFormProps {
  fetchUrls: () => void;
  showAddForm: boolean;
  setShowAddForm: (showAddForm: boolean) => void;
  trackPersonId: string;
}

const NewUrlForm = ({ fetchUrls, showAddForm, setShowAddForm, trackPersonId }: NewUrlFormProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAdding(true);

    try {
      const { data } = await axios.post("/api/tracking-urls", {
        title,
        url,
        trackPersonId,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to add tracking URL");
      }
      toast.success("Tracking URL added successfully");
      setShowAddForm(false);
      setTitle("");
      setUrl("");
      fetchUrls();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (!showAddForm) return null;

  return (
    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
      <DialogContent>
        <DialogTitle>Add New URL</DialogTitle>
        <DialogDescription>Add a new URL to track</DialogDescription>
        <form onSubmit={handleAddProfile} className="space-y-4">
          <div>
            <Input
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4"
            />
            <Input placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full" />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex gap-5 justify-center">
            <LoadingButton type="submit" isLoading={isAdding}>
              Add URL
            </LoadingButton>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setError("");
                setTitle("");
                setUrl("");
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewUrlForm;
