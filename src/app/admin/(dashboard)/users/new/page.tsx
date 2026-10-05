import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/db/entities";
import { UserCreateForm } from "./UserCreateForm";

export const dynamic = "force-dynamic";

export default async function NewAdminUserPage() {
  const session = await getSession();

  if (!session || session.role !== UserRole.SUPERADMIN) {
    redirect("/admin");
  }

  return <UserCreateForm />;
}
