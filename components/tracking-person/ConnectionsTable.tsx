"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
interface Connection {
  id: string;
  name: string;
  profileUrl: string;
  syncedAt: string;
}

interface PaginationInfo {
  total: number;
  currentPage: number;
  totalPages: number;
}

interface ConnectionsTableRef {
  fetchConnections: () => Promise<void>;
}

const ConnectionsTable = React.forwardRef<ConnectionsTableRef>((props, ref) => {
  const { id } = useParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [syncDates, setSyncDates] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const { data: session } = useSession();

  const fetchConnections = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        trackPersonId: id as string,
      });

      if (selectedDate) {
        params.append("syncDate", selectedDate);
      }

      const { data } = await axios.get(`/api/linkedin/connections?${params}`);
      if (data.success) {
        setConnections(data.data.connections);
        setSyncDates(data.data.syncDates);
        setPagination(data.data.pagination);
      } else {
        toast.error("Failed to fetch connections");
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.id) {
      fetchConnections();
    }
  }, [selectedDate, session?.user.id]);

  const handlePageChange = (newPage: number) => {
    fetchConnections(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Expose fetchConnections method through ref
  React.useImperativeHandle(ref, () => ({
    fetchConnections: () => fetchConnections(),
  }));

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Connections</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedDate || "all"} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {syncDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Profile URL</TableHead>
              <TableHead>Synced At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : connections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No connections found
                </TableCell>
              </TableRow>
            ) : (
              connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>{connection.name}</TableCell>
                  <TableCell>
                    <a
                      href={connection.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {connection.profileUrl}
                    </a>
                  </TableCell>
                  <TableCell>{formatDate(connection.syncedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
});

ConnectionsTable.displayName = "ConnectionsTable";

export default ConnectionsTable;
