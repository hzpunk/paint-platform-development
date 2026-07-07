"use client";

export function LoadingSpinner() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
    </div>
  );
}
