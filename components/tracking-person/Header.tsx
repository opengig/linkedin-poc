import { Loader2, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const Header = ({
  person,
  onAddUrl,
  onSync,
  isSyncing,
}: {
  person: any;
  onAddUrl: () => void;
  onSync: () => void;
  isSyncing: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img src={person.avatar || ""} alt={person.name || ""} className="w-12 h-12 rounded-full" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-medium">{person.name}</h1>
          <p className="text-sm text-gray-500">{person.title}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="link" className="flex items-center space-x-2" onClick={onAddUrl}>
          <Plus />
          New Search Url
        </Button>

        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button variant="default" className="flex items-center space-x-2" onClick={onSync} disabled={isSyncing}>
              {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Sync Connections
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Note: This will sync connections from all the search urls below
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default Header;
