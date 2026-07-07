import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "../../../lib/serverAuth";
import AdminOrders from "../../../components/admin-orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return <AdminOrders />;
}
