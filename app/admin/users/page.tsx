import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "../../../lib/serverAuth";
import AdminUsersTable from "../../../components/admin-users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return <AdminUsersTable />;
}
