"use client";

import { FileText, Download, User, Bookmark } from "lucide-react";
import type { Note } from "@/db/entities";
import { trackClientEvent } from "@/components/AnalyticsTracker";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220] dark:border-slate-800 dark:hover:border-emerald-500/40 p-5 flex flex-col justify-between transition-colors">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40">
            {note.format}
          </span>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {note.level}
          </span>
        </div>

        <div>
          <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
            <Bookmark className="w-3 h-3" />
            <span>{note.topic}</span>
          </div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
            {note.title}
          </h4>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {note.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{note.author}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
            <Download className="w-3 h-3" />
            <span>{note.downloadCount}</span>
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
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
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
                  metadata: { topic: note.topic, format: note.format },
                });
              }}
              className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Preview
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
