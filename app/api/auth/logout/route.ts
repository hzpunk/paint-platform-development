import { clearAuthCookie } from "@/lib/serverAuth";

export async function POST() {
  return clearAuthCookie();
}
