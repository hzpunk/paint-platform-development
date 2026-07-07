import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "../../../lib/serverAuth";
import AdminProducts from "../../../components/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return <AdminProducts />;
}
