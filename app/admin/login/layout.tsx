import { ReactNode } from "react";

export default function AdminLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-background p-8 shadow-lg shadow-black/5">
        {children}
      </div>
    </div>
  );
}
