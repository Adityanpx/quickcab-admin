import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireRole } from "@/components/auth/RequireRole";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireRole>
  );
}
