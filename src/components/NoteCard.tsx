import { FileText, Download, User, Eye, Bookmark } from "lucide-react";
import type { Note } from "@/db/entities";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const formatBadgeColors: Record<string, string> = {
    PDF: "bg-red-500/15 text-red-300 border-red-500/30",
    Infographic: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    "Cheat Sheet": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  };

  const badgeColor =
    formatBadgeColors[note.format] ||
    "bg-slate-700/50 text-slate-300 border-slate-600";

  return (
    <div className="group rounded-2xl bg-[#0f172a]/70 border border-slate-800 hover:border-emerald-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/20">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}
          >
            {note.format}
          </span>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {note.level}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1 mb-1">
            <Bookmark className="w-3 h-3" />
            {note.topic}
          </span>
          <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
            {note.title}
          </h4>
        </div>

        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {note.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{note.author}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
            <Download className="w-3 h-3" />
            <span>{note.downloadCount} dl</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {note.fileUrl && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Study Note</span>
            </a>
          )}
          {note.previewUrl && (
            <a
              href={note.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Preview Note"
            >
              <Eye className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
