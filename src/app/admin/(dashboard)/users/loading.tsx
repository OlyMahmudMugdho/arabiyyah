import { TableSkeleton } from "@/components/Skeletons";

export default function AdminUsersLoading() {
  return <TableSkeleton rows={5} cols={5} />;
}
