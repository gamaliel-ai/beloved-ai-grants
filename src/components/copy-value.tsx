"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyValue({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const fallback = useRef<HTMLTextAreaElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      fallback.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <>
      <textarea
        ref={fallback}
        className="fixed -left-[9999px] h-px w-px opacity-0"
        aria-hidden="true"
        tabIndex={-1}
        readOnly
        value={value}
      />
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Copied" : label}
      </Button>
    </>
  );
}
