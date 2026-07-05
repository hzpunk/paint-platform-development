import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { AdminDocumentsTable } from "@/components/admin/documents-table";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Документы</h1>
        <p className="text-sm text-muted-foreground">Управление документами</p>
      </div>
      <AdminDocumentsTable initialDocuments={documents} />
    </div>
  );
}
