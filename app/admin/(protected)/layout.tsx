import { AdminShell } from "@/components/admin/admin-shell";
import { requireSupportUser } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSupportUser();
  return <AdminShell name={profile.full_name}>{children}</AdminShell>;
}
