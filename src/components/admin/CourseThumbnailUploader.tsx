"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  Cloud,
  Link as LinkIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import {
  uploadCourseThumbnailAction,
  getCloudinaryConfigStatusAction,
} from "@/actions/course-actions";

interface CourseThumbnailUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  onUploadStateChange?: (uploading: boolean) => void;
}

export function CourseThumbnailUploader({
  value,
  onChange,
  disabled = false,
  onUploadStateChange,
}: CourseThumbnailUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check Cloudinary environment configuration status on mount
  useEffect(() => {
    let isMounted = true;
    getCloudinaryConfigStatusAction()
      .then((res) => {
        if (isMounted) {
          setCloudinaryConfigured(res.configured);
          if (!res.configured && !value) {
            // Default to URL tab if Cloudinary is not configured yet
            setActiveTab("url");
          }
        }
      })
      .catch(() => {
        if (isMounted) setCloudinaryConfigured(false);
      });
    return () => {
      isMounted = false;
    };
  }, [value]);

  const setUploadingState = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadStateChange?.(uploading);
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSuccess(null);

    // Client-side validations
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, GIF, etc.).");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError("Image size exceeds maximum limit of 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingState(true);

    try {
      const result = await uploadCourseThumbnailAction(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange(result.url);
        setSuccess("Thumbnail uploaded successfully to Cloudinary!");
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error during image upload."
      );
    } finally {
      setUploadingState(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCopyUrl = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const isCloudinaryUrl =
    typeof value === "string" &&
    (value.includes("cloudinary.com") || value.includes("res.cloudinary.com"));

  return (
    <div className="space-y-3">
      {/* Tab Switcher & Configuration Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              setError(null);
            }}
            disabled={disabled || isUploading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Upload Image (Cloudinary)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("url");
              setError(null);
            }}
            disabled={disabled || isUploading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "url"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste URL</span>
          </button>
        </div>

        {/* Cloudinary environment badge */}
        {cloudinaryConfigured !== null && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {cloudinaryConfigured ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloudinary Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span>Cloudinary credentials pending in .env</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cloudinary Missing Warning if user is on Upload tab */}
      {activeTab === "upload" && cloudinaryConfigured === false && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Cloudinary API Auth Environment Variables Missing</span>
          </div>
          <p className="text-[11px] leading-relaxed pl-5.5 text-amber-700 dark:text-amber-300/90">
            Direct file uploads require{" "}
            <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[10px]">
              CLOUDINARY_CLOUD_NAME
            </code>
            ,{" "}
            <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[10px]">
              CLOUDINARY_API_KEY
            </code>
            , and{" "}
            <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[10px]">
              CLOUDINARY_API_SECRET
            </code>{" "}
            in your <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[10px]">.env</code> file. You can also paste an external image URL in the tab above.
          </p>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      {activeTab === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled && !isUploading) {
                fileInputRef.current?.click();
              }
            }}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]"
                : "border-slate-300 hover:border-emerald-500/70 bg-slate-50/60 hover:bg-slate-50 dark:border-slate-700/80 dark:hover:border-emerald-500/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2.5">
                <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Uploading image to Cloudinary...
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Optimizing and securing thumbnail asset...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      Click to browse image file
                    </span>{" "}
                    or drag & drop
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PNG, JPG, WEBP, or GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Input Form */}
      {activeTab === "url" && (
        <div className="space-y-1.5">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-... or cloud image URL"
              value={value}
              onChange={(e) => {
                setError(null);
                onChange(e.target.value);
              }}
              disabled={disabled || isUploading}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Paste any direct public image URL (Unsplash, Cloudinary, AWS S3, etc.).
          </p>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Live Preview Card */}
      {value && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Current Course Thumbnail Preview</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isCloudinaryUrl ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-[10px] font-bold">
                  <Cloud className="w-3 h-3" />
                  <span>Cloudinary Asset</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] font-medium">
                  <LinkIcon className="w-3 h-3" />
                  <span>External URL</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => onChange("")}
                disabled={disabled || isUploading}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                title="Remove Thumbnail"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Image Preview Box */}
            <div className="relative aspect-video sm:aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Course thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x400/0f172a/10b981?text=Thumbnail+Not+Found";
                }}
              />
            </div>

            {/* Thumbnail URL display & quick actions */}
            <div className="sm:col-span-2 space-y-2 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Thumbnail URL:
                </span>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all">
                  <span className="line-clamp-2 flex-1">{value}</span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 transition-colors"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 transition-colors"
                    title="Open Image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={disabled || isUploading}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" />
                  <span>Replace via Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  disabled={disabled || isUploading}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
