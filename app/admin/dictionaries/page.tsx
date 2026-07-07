import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import AdminDictionaryManager from "@/components/admin-dictionary-manager";

export const dynamic = "force-dynamic";

export default async function AdminDictionariesPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return <AdminDictionaryManager />;
}
