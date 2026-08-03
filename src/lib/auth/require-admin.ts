import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail, normalizeEmail } from "./admin-emails";

export async function requireAdmin() {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_TEST_BYPASS === "1"
  ) {
    return normalizeEmail(
      process.env.AUTH_TEST_EMAIL ?? "test-admin@example.com",
    );
  }

  const session = await auth();
  const email = session?.user?.email;
  if (!isAdminEmail(email)) {
    redirect("/sign-in");
  }
  return normalizeEmail(email!);
}
