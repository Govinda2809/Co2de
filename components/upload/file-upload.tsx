"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode, X, Loader2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesAccepted: (files: { file: File, content: string }[]) => void;
  isLoading?: boolean;
  acceptedFiles?: File[];
  onClear?: () => void;
}

export function FileUpload({ onFilesAccepted, isLoading, acceptedFiles = [], onClear }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    async (dropFiles: File[]) => {
      const processed = await Promise.all(
        dropFiles.map(async (file) => ({
          file,
          content: await file.text(),
        }))
      );
      onFilesAccepted(processed);
    },
    [onFilesAccepted]
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
    maxFiles: 20,
    disabled: isLoading,
  });

  if (acceptedFiles.length > 0) {
    return (
      <div className="relative rounded-[2.5rem] border-2 border-emerald-500/30 bg-emerald-500/[0.02] p-8 space-y-4">
        <button
          onClick={onClear}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <FolderOpen className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="font-black text-xl tracking-tighter uppercase">{acceptedFiles.length} Object{acceptedFiles.length > 1 ? 's' : ''}_Captured</p>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Target Repository Size: {(acceptedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {acceptedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 group">
              <FileCode size={14} className="text-gray-500 group-hover:text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-400 truncate flex-1">{file.name}</span>
              <span className="text-[9px] font-mono text-gray-600">{(file.size / 1024).toFixed(1)}K</span>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="pt-4 flex items-center justify-center gap-3 text-emerald-500 font-bold text-xs uppercase tracking-widest animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Synchronizing_Data...
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative rounded-[3rem] border-2 border-dashed transition-all duration-700 cursor-pointer group overflow-hidden",
        "bg-white/[0.01] hover:bg-emerald-500/[0.03]",
        isDragActive || dragActive
          ? "border-emerald-500 bg-emerald-500/5 scale-[0.98]"
          : "border-white/10 hover:border-emerald-500/30",
        isLoading && "pointer-events-none opacity-50"
      )}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-24 px-12 relative z-10">
        <div
          className={cn(
            "w-20 h-20 rounded-[2rem] mb-8 flex items-center justify-center transition-all duration-700 shadow-3xl",
            isDragActive ? "bg-emerald-500 rotate-90" : "bg-white/5 border border-white/10 group-hover:rotate-6 group-hover:bg-white/10"
          )}
        >
          <Upload
            className={cn(
              "w-8 h-8 transition-colors duration-700",
              isDragActive ? "text-black" : "text-gray-500 group-hover:text-emerald-500"
            )}
          />
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white">
            {isDragActive ? "Release_Protocol" : "Initiate_Sequence"}
          </h3>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] max-w-xs leading-relaxed opacity-50">
            Drop files or directories to perform a multi-layered carbon audit.
          </p>
        </div>
        
        <div className="mt-12 flex gap-4">
           <span className="px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[8px] font-mono text-gray-600">JS/TS</span>
           <span className="px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[8px] font-mono text-gray-600">PY/GO</span>
           <span className="px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-[8px] font-mono text-gray-600">+ MORE</span>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 opacity-0 group-hover:opacity-10 transition-opacity" />
    </div>
  );
}
