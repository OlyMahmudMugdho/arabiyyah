"use client";

import { FileText, Download, User, Eye, Bookmark } from "lucide-react";
import type { Note } from "@/db/entities";
import { trackClientEvent } from "@/components/AnalyticsTracker";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const formatBadgeColors: Record<string, string> = {
    PDF: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    Infographic: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    "Cheat Sheet": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  };

  const badgeColor =
    formatBadgeColors[note.format] ||
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600";

  return (
    <div className="group rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-xl dark:bg-[#0f172a]/70 dark:border-slate-800 dark:hover:border-emerald-500/50 dark:hover:shadow-emerald-950/20 p-5 flex flex-col justify-between transition-all duration-300">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}
          >
            {note.format}
          </span>
          <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/20">
            {note.level}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400/90 flex items-center gap-1 mb-1">
            <Bookmark className="w-3 h-3" />
            {note.topic}
          </span>
          <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
            {note.title}
          </h4>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {note.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
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
              onClick={() => {
                trackClientEvent({
                  eventType: "book_download",
                  resourceType: "note",
                  resourceId: note.id,
                  resourceTitle: note.title,
                  path: note.fileUrl,
                  metadata: {
                    topic: note.topic,
                    format: note.format,
                    level: note.level,
                    author: note.author,
                  },
                });
              }}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
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
              onClick={() => {
                trackClientEvent({
                  eventType: "note_view",
                  resourceType: "note",
                  resourceId: note.id,
                  resourceTitle: note.title,
                  path: note.previewUrl,
                  metadata: {
                    action: "preview",
                    topic: note.topic,
                  },
                });
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/60"
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
