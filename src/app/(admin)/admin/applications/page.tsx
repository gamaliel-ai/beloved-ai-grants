import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review queue for unmatched conference signups.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending review</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No applications yet. The intake and approval flow ships with{" "}
          <span className="font-medium text-foreground">B-0006</span> (and claim
          email delivery in B-0003).
        </CardContent>
      </Card>
    </div>
  );
}
