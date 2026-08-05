import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  AdminAuthError,
  assertAdminEmail,
  getAuthTestEmail,
  isAuthTestBypassActive,
} from "./admin-auth";

export async function requireAdmin() {
  try {
    if (isAuthTestBypassActive()) {
      return assertAdminEmail(getAuthTestEmail());
    }
    const session = await auth();
    return assertAdminEmail(session?.user?.email);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/sign-in");
    }
    throw error;
  }
}
