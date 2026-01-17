"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode, X, Loader2, FolderOpen, Zap, Plus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

interface FileUploadProps {
  onFilesAccepted: (files: { file: File, content: string }[]) => void;
  isLoading?: boolean;
  acceptedFiles?: File[];
  onClear?: () => void;
}

const SUPPORTED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.rs', '.go', '.php', '.rb', '.swift', '.kt'
];

export function FileUpload({ onFilesAccepted, isLoading, acceptedFiles = [], onClear }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const processFile = async (file: File): Promise<{ file: File, content: string }[]> => {
    if (file.name.endsWith('.zip')) {
      setIsExtracting(true);
      try {
        const zip = new JSZip();
        const content = await file.arrayBuffer();
        const zipResult = await zip.loadAsync(content);
        const extracted: { file: File, content: string }[] = [];

        for (const [path, zipEntry] of Object.entries(zipResult.files)) {
          if (!zipEntry.dir && SUPPORTED_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext))) {
            const fileContent = await zipEntry.async("string");
            const blob = new Blob([fileContent], { type: "text/plain" });
            const extractedFile = new File([blob], path.split('/').pop() || path, { type: "text/plain" });
            extracted.push({ file: extractedFile, content: fileContent });
          }
        }
        setIsExtracting(false);
        return extracted;
      } catch (e) {
        console.error("Zip extraction failed", e);
        setIsExtracting(false);
        return [];
      }
    } else {
      return [{ file, content: await file.text() }];
    }
  };

  const onDrop = useCallback(
    async (dropFiles: File[]) => {
      const allResults = await Promise.all(dropFiles.map(processFile));
      onFilesAccepted(allResults.flat());
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
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"]
    },
    maxFiles: 20,
    disabled: isLoading || isExtracting,
  });

  if (acceptedFiles.length > 0) {
    return (
      <div className="relative pixel-border bg-emerald-900/10 p-8 space-y-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-500">
        <button
          onClick={onClear}
          className="absolute top-4 right-4 p-2 bg-black border border-white hover:bg-red-500 hover:text-white transition-colors pixel-border"
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-emerald-500 text-black pixel-border">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="font-pixel text-xl tracking-wide uppercase text-white">{acceptedFiles.length} FILE{acceptedFiles.length !== 1 && 'S'}_LOADED</p>
            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Payload: {(acceptedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border-2 border-white/10 p-2 bg-black/50">
          {acceptedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-2 border-b border-white/10 last:border-0 hover:bg-white/5 transition-all">
              <FileCode size={14} className="text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-300 truncate flex-1 uppercase">{file.name}</span>
              <span className="text-[9px] font-mono text-gray-500">{(file.size / 1024).toFixed(1)}K</span>
            </div>
          ))}
        </div>

        {(isLoading || isExtracting) && (
          <div className="pt-4 flex items-center justify-center gap-3 text-emerald-500 font-pixel text-xs uppercase animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isExtracting ? "UNPACKING_ARCHIVE..." : "SYNCING_DATA_STREAM..."}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative rounded-4xl border transition-all duration-300 cursor-pointer group overflow-hidden bg-black/40 backdrop-blur-xl p-8 max-w-2xl mx-auto",
        isDragActive || dragActive
          ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          : "border-white/5 hover:border-emerald-500/50 hover:bg-white/5",
        (isLoading || isExtracting) && "pointer-events-none opacity-50"
      )}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center relative z-10 space-y-4">
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-lg",
            isDragActive ? "bg-emerald-500 text-black scale-110" : "bg-white/5 text-gray-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500"
          )}
        >
          {isExtracting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
            {isDragActive ? "Drop to Analyze" : "Upload Code"}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Drag & drop or click to select files
          </p>
        </div>

        <div className="flex gap-2">
          {['JS', 'TS', 'PY', 'RS', 'ZIP'].map(tech => (
            <span key={tech} className="px-2 py-0.5 rounded-full border border-white/5 bg-white/5 text-[10px] font-medium text-gray-500 group-hover:border-emerald-500/20 group-hover:text-emerald-500/60 transition-colors">{tech}</span>
          ))}
        </div>
      </div>

      {/* Subtle Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/5 transition-all duration-500 pointer-events-none" />
    </div>
  );
}
