// /components/transparency/TransparencyHeader.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filters } from "@/app/(routes)/ops/transparency/page";

export function TransparencyHeader({
  onFilterChange,
}: {
  onFilterChange: (f: Filters) => void;
}) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b">
      <h2 className="text-xl font-semibold">Transparency Dashboard</h2>

      <div className="flex flex-wrap gap-2 items-center">
        <Select
          onValueChange={(val) =>
            onFilterChange({ severity: val as Filters["severity"] })
          }
        >
          <SelectTrigger className="w-[140px]">Severity</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) =>
            onFilterChange({ type: val as Filters["type"] })
          }
        >
          <SelectTrigger className="w-40">Type</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user-action">User Action</SelectItem>
            <SelectItem value="system-event">System Event</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
            <SelectItem value="security-event">Security</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onFilterChange({ search: e.target.value });
          }}
          className="w-[220px]"
        />

        <Button
          variant="outline"
          onClick={() =>
            onFilterChange({ search: "", type: "all", severity: "all" })
          }
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
