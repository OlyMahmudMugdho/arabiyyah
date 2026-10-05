import { TableSkeleton } from "@/components/Skeletons";

export default function AdminCoursesLoading() {
  return <TableSkeleton rows={7} cols={5} />;
}
