import { TableSkeleton } from "@/components/Skeletons";

export default function AdminNotesLoading() {
  return <TableSkeleton rows={7} cols={5} />;
}
