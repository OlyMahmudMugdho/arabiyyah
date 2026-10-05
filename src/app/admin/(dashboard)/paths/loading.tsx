import { TableSkeleton } from "@/components/Skeletons";

export default function AdminPathsLoading() {
  return <TableSkeleton rows={6} cols={5} />;
}
