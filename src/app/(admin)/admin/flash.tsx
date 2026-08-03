import { Alert, AlertDescription } from "@/components/ui/alert";

export function FlashMessages({
  notice,
  error,
}: {
  notice?: string;
  error?: string;
}) {
  return (
    <>
      {notice ? (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
