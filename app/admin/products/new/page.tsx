import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import AdminProductEditor from "@/components/admin-product-editor";

export const dynamic = "force-dynamic";

export default async function ProductNewPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  return <AdminProductEditor />;
}
