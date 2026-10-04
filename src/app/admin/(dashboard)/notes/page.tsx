import { getNotesAction } from "@/actions/note-actions";
import { NoteManager } from "./NoteManager";

export default async function AdminNotesPage() {
  const notes = await getNotesAction({ onlyPublished: false });

  return <NoteManager initialNotes={notes} />;
}
