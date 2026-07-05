import "./admin.css";
import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export const metadata = {
  title: "Админка — КраскаПроф",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.08),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.02),_transparent)] text-foreground">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
