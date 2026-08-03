import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-primary">Build what matters</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Practical AI access for early entrepreneurs.
        </h1>
        <p className="text-lg text-muted-foreground">
          Beloved sponsors coding tools and OpenAI API access for approved
          founders. Event participants can use their program link to redeem.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Have a program invite?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Open the private link or QR supplied by your program organizer. Your
          email must already be on the program allowlist.
        </CardContent>
      </Card>
    </div>
  );
}
