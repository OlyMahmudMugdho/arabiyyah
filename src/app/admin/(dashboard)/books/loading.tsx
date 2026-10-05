import { TableSkeleton } from "@/components/Skeletons";

export default function AdminBooksLoading() {
  return <TableSkeleton rows={7} cols={5} />;
}
