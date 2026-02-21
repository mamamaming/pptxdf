"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileWarning } from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface DropzoneProps {
    onFileAccepted: (file: File) => void;
    disabled: boolean;
}

export default function Dropzone({ onFileAccepted, disabled }: DropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndAccept = useCallback(
        (file: File) => {
            setError(null);

            if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
                setError("Only PDF files are accepted.");
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setError("File exceeds the 50MB size limit.");
                return;
            }

            onFileAccepted(file);
        },
        [onFileAccepted]
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) setIsDragOver(true);
        },
        [disabled]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                validateAndAccept(files[0]);
            }
        },
        [disabled, validateAndAccept]
    );

    const handleClick = useCallback(() => {
        if (!disabled) {
            inputRef.current?.click();
        }
    }, [disabled]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                validateAndAccept(files[0]);
            }
            // Reset so the same file can be re-uploaded
            e.target.value = "";
        },
        [validateAndAccept]
    );

    return (
        <div className="w-full">
            <div
                id="dropzone"
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-2xl
          transition-all duration-300 ease-out
          flex flex-col items-center justify-center
          min-h-[280px] px-8 py-12
          ${disabled ? "opacity-40 cursor-not-allowed" : ""}
          ${isDragOver
                        ? "border-white bg-white/10 scale-[1.02]"
                        : "border-white/20 hover:border-white/50 hover:bg-white/[0.03]"
                    }
        `}
            >
                {/* Glow effect on hover */}
                <div
                    className={`
            absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
            ${isDragOver ? "opacity-100" : "group-hover:opacity-100"}
            bg-gradient-to-b from-white/[0.04] to-transparent
            pointer-events-none
          `}
                />

                <div
                    className={`
            relative z-10 flex flex-col items-center gap-5
            transition-transform duration-300
            ${isDragOver ? "scale-110" : ""}
          `}
                >
                    <div
                        className={`
              p-5 rounded-2xl transition-all duration-300
              ${isDragOver
                                ? "bg-white/15 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                : "bg-white/[0.06] group-hover:bg-white/10"
                            }
            `}
                    >
                        <Upload
                            className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? "text-white" : "text-white/50 group-hover:text-white/80"
                                }`}
                            strokeWidth={1.5}
                        />
                    </div>

                    <div className="text-center space-y-2">
                        <p
                            className={`text-base font-medium transition-colors duration-300 ${isDragOver ? "text-white" : "text-white/70"
                                }`}
                        >
                            {isDragOver ? "Drop your PDF here" : "Drop PDF or click to upload"}
                        </p>
                        <p className="text-sm text-white/30">.pdf only · 50MB max</p>
                    </div>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload PDF file"
                />
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm px-1 animate-in fade-in slide-in-from-top-1">
                    <FileWarning className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
