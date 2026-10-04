import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/db/entities";
import { getAdminUsersAction } from "@/actions/user-actions";
import { UserManager } from "./UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();

  if (!session || session.role !== UserRole.SUPERADMIN) {
    redirect("/admin");
  }

  const res = await getAdminUsersAction();
  const users = (res.users || []) as any[];

  return <UserManager initialUsers={users} currentUserId={session.userId} />;
}
