import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Administrator sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <Button className="w-full" type="submit">
            Continue with GitHub
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
