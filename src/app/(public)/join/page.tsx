import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/lib/site";
import { JoinForm } from "./join-form";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] font-medium tracking-[0.28em] text-brand-gold-deep uppercase">
          Program access
        </p>
        <h1 className="font-display text-3xl font-light tracking-tight">
          Join {site.name}
        </h1>
        <p className="font-light text-muted-foreground text-pretty">
          Enter the email your organizer registered. If it matches, we email a
          short-lived claim link so you can mint your sponsored API key.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Program email</CardTitle>
        </CardHeader>
        <CardContent>
          <JoinForm />
        </CardContent>
      </Card>
    </div>
  );
}
