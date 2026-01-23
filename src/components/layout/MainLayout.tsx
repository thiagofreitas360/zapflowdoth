import { AppSidebar } from "./AppSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <AppSidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}