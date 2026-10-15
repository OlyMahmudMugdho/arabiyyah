import { notFound } from "next/navigation";
import { getPathRepository } from "@/db/data-source";
import { PathEditForm } from "./PathEditForm";

export const dynamic = "force-dynamic";

export default async function AdminPathEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pathRepo = await getPathRepository();
  const path = await pathRepo.findOne({ where: { id } });

  if (!path) {
    notFound();
  }

  return <PathEditForm path={path} />;
}
