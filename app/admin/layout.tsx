import { ReactNode } from "react";
import { AdminSidebar } from "../../components/admin-sidebar";

export const metadata = {
  title: "Админка — КраскиУНАС",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lg:flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
