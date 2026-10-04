import { getPathsAction } from "@/actions/path-actions";
import { PathManager } from "./PathManager";

export const dynamic = "force-dynamic";

export default async function AdminPathsPage() {
  const paths = await getPathsAction({ onlyPublished: false });

  return <PathManager initialPaths={paths} />;
}
