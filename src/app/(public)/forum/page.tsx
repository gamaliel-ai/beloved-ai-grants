import { redirect } from "next/navigation";
import { featuredEventSlug } from "@/lib/site";

/**
 * /forum is the short, sayable URL for stages and printed cards. It always
 * points at whichever event is currently featured.
 */
export default function ForumIndexPage() {
  redirect(featuredEventSlug ? `/forum/${featuredEventSlug}` : "/");
}
