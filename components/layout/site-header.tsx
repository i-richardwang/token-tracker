"use client";

import { Activity } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <Activity className="h-6 w-6" />
        <span className="text-2xl font-semibold">LLMeter</span>
        <span className="text-base text-muted-foreground">My LLM Usage Dashboard</span>
      </div>
    </header>
  );
}
