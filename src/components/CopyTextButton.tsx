"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyTextButton({ text, label = "Copy report" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  async function copy() {
    setState("idle");
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("err");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
      {state === "ok" ? "Copied" : state === "err" ? "Copy blocked" : label}
    </Button>
  );
}
