import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "../../../lib/serverAuth";
import AdminAnalyticsPanel from "../../../components/admin-analytics-panel";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const cookieHeader = (await headers()).get("cookie");
  const user = await getUserFromCookieHeader(cookieHeader);
  if (!user || user.role !== "admin") redirect("/admin/login");

  return <AdminAnalyticsPanel />;
}
