import { Card, CardContent } from "@/components/ui/card";
import { JoinForm } from "@/components/join-form";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-[0.24em] text-brand-gold-deep uppercase">
          Programme access
        </p>
        <h1 className="font-display text-3xl font-light tracking-tight">
          Join {site.name}
        </h1>
        <p className="font-light text-muted-foreground text-pretty">
          Enter the email you gave your organiser. If it matches, we email you a
          claim link so you can create your sponsored API key. The link expires
          shortly, so open it soon after it arrives.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <JoinForm idPrefix="join-page" />
        </CardContent>
      </Card>
    </div>
  );
}
