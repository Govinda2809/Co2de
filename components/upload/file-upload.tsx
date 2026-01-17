"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileAccepted: (file: File, content: string) => void;
  isLoading?: boolean;
  acceptedFile?: File | null;
  onClear?: () => void;
}

export function FileUpload({ onFileAccepted, isLoading, acceptedFile, onClear }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const content = await file.text();
        onFileAccepted(file, content);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt", ".md"],
      "text/javascript": [".js", ".jsx", ".mjs"],
      "text/typescript": [".ts", ".tsx"],
      "text/html": [".html"],
      "text/css": [".css"],
      "application/json": [".json"],
      "text/x-python": [".py"],
      "text/x-java": [".java"],
      "text/x-c": [".c", ".cpp", ".h"],
      "text/x-rust": [".rs"],
      "text/x-go": [".go"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  if (acceptedFile) {
    return (
      <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 p-8">
        <button
          onClick={onClear}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10">
            <FileCode className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg truncate">{acceptedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(acceptedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-emerald-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
        "hover:border-emerald-500/50 hover:bg-emerald-500/5",
        isDragActive || dragActive
          ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]"
          : "border-gray-300 dark:border-gray-700",
        isLoading && "pointer-events-none opacity-50"
      )}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div
          className={cn(
            "p-5 rounded-3xl mb-6 transition-all duration-500 shadow-2xl",
            isDragActive ? "bg-white/20 scale-110 rotate-12" : "bg-white/5 border border-white/10"
          )}
        >
          <Upload
            className={cn(
              "w-10 h-10 transition-colors",
              isDragActive ? "text-white" : "text-gray-500"
            )}
          />
        </div>
        <p className="text-xl font-bold mb-2 text-white">
          {isDragActive ? "DROP TO ANALYZE" : "SUBMIT YOUR CODE"}
        </p>
        <p className="text-sm text-gray-500 text-center max-w-xs uppercase tracking-widest font-mono">
          Supports .js, .ts, .py, .java, .rs, .go etc.
        </p>
        <button className="mt-6 px-6 py-2 rounded-full border border-white/20 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
          or select manually
        </button>
      </div>
    </div>
  );
}
