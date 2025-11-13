"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Filters() {
  return (
    <div
      data-guide="filters"
      className="
        flex gap-4 p-4 border-b 
        overflow-x-auto 
        scrollbar-hide
        sm:overflow-x-visible 
        w-full
      "
    >
      <Select defaultValue="alltime">
        <SelectTrigger className="min-w-[12rem] flex-shrink-0">
          <SelectValue placeholder="Timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alltime">Timeframe: All-time</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger className="min-w-[12rem] flex-shrink-0">
          <SelectValue placeholder="People" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">People: All</SelectItem>
          <SelectItem value="online">Online Only</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger className="min-w-[12rem] flex-shrink-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status: All</SelectItem>
          <SelectItem value="up">Up</SelectItem>
          <SelectItem value="down">Down</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
