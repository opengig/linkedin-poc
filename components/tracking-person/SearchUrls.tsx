"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";
import toast from "react-hot-toast";
import { LoadingButton } from "../ui/loading-button";
import { Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { TooltipContent } from "../ui/tooltip";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";

interface SearchUrl {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

interface SearchUrlsProps {
  urls: SearchUrl[];
  fetchUrls: () => void;
  onSync: (urlId: string) => void;
  syncingUrlIds: string[];
}

const SearchUrls = ({ urls, fetchUrls, onSync, syncingUrlIds }: SearchUrlsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (url: SearchUrl) => {
    setEditingId(url.id);
    setEditTitle(url.title);
    setEditUrl(url.url);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await axios.put("/api/tracking-urls", {
        id,
        title: editTitle,
        url: editUrl,
      });

      if (!data.success) {
        throw new Error(data.error || "Failed to update URL");
      }

      toast.success("URL updated successfully");
      setEditingId(null);
      fetchUrls();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await axios.delete(`/api/tracking-urls?id=${id}`);

      if (!data.success) {
        throw new Error(data.error || "Failed to delete URL");
      }

      toast.success("URL deleted successfully");
      fetchUrls();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!urls.length) {
    return <div className="text-center text-gray-500 mt-4">No URLs found</div>;
  }

  return (
    <div className="space-y-4 mt-8">
      <p className="text-lg font-medium">Search URLs</p>
      {urls.map((url) => (
        <div key={url.id} className="border rounded-lg p-4 space-y-2">
          {editingId === url.id ? (
            <>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter title"
                className="mb-2"
              />
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="Enter URL"
                className="mb-2"
              />
              <div className="flex gap-2">
                <LoadingButton onClick={() => handleSaveEdit(url.id)} isLoading={isLoading}>
                  Save
                </LoadingButton>
                <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{url.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => onSync(url.id)}
                            size={"sm"}
                            variant="outline"
                            className="flex items-center space-x-2"
                          >
                            {syncingUrlIds.includes(url.id) ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">Sync connections from this URL</TooltipContent>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(url)}
                        disabled={isLoading}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(url.id)}
                        disabled={isLoading}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all text-sm"
                  >
                    {url.url}
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchUrls;
