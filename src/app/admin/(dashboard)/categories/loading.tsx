import { TableSkeleton } from "@/components/Skeletons";

export default function AdminCategoriesLoading() {
  return <TableSkeleton rows={6} cols={5} />;
}
