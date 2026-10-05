"use client";

import { BookOpen, Download, FileText, Globe } from "lucide-react";
import type { Book } from "@/db/entities";
import { trackClientEvent } from "@/components/AnalyticsTracker";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="group rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-xl dark:bg-[#0f172a]/70 dark:border-slate-800 dark:hover:border-emerald-500/50 dark:hover:shadow-emerald-950/20 p-5 flex flex-col justify-between transition-all duration-300">
      <div className="flex gap-4 items-start">
        {/* Book Cover or Graphic */}
        <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-800 to-amber-950 border border-slate-700/60 shadow-md flex items-center justify-center relative">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <BookOpen className="w-8 h-8 text-emerald-400/50" />
          )}
        </div>

        {/* Book details */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              {book.category}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {book.language}
            </span>
          </div>

          <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
            {book.title}
          </h4>

          {book.titleArabic && (
            <p className="font-arabic text-xs font-semibold text-emerald-700 dark:text-emerald-400/90 line-clamp-1">
              {book.titleArabic}
            </p>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400">
            By <span className="text-slate-900 dark:text-slate-300 font-medium">{book.author}</span>
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 pt-1 leading-relaxed">
            {book.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {book.pages} pages
          </span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400/90 font-medium">{book.level}</span>
        </div>

        {book.fileUrl ? (
          <a
            href={book.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackClientEvent({
                eventType: "book_download",
                resourceType: "book",
                resourceId: book.id,
                resourceTitle: book.title,
                path: book.fileUrl,
                metadata: {
                  author: book.author,
                  category: book.category,
                  level: book.level,
                },
              });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Resource In-Library</span>
        )}
      </div>
    </div>
  );
}
