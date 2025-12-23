"use client";

import { Activity } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <Activity className="h-5 w-5" />
        <span className="font-semibold">Token Tracker</span>
      </div>
    </header>
  );
}
