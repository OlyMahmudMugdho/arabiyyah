"use client";

import { BookOpen, Download, Globe, FileText } from "lucide-react";
import type { Book } from "@/db/entities";
import { trackClientEvent } from "@/components/AnalyticsTracker";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220] dark:border-slate-800 dark:hover:border-emerald-500/40 p-5 flex flex-col justify-between transition-colors">
      <div className="flex gap-4 items-start">
        {/* Book Cover or Scholastic Folio */}
        <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center relative">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 dark:text-slate-500">
              <BookOpen className="w-6 h-6 mb-1 text-emerald-700/60 dark:text-emerald-400/60" />
              <span className="font-arabic text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">كتاب</span>
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
              {book.category}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{book.language}</span>
            </span>
          </div>

          <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
            {book.title}
          </h4>

          {book.titleArabic && (
            <p className="font-arabic text-xs font-semibold text-emerald-800 dark:text-emerald-400 line-clamp-1" dir="rtl">
              {book.titleArabic}
            </p>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400">
            By <span className="text-slate-900 dark:text-slate-200 font-medium">{book.author}</span>
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 leading-relaxed">
            {book.description}
          </p>
        </div>
      </div>

      {/* Footer & Download Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{book.pages} pages</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {book.level}
          </span>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400">Curated in archive</span>
        )}
      </div>
    </div>
  );
}
