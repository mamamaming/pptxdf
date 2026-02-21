"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download, RotateCcw } from "lucide-react";

interface DownloadButtonProps {
    blob: Blob;
    fileName: string;
    onReset: () => void;
}

export default function DownloadButton({
    blob,
    fileName,
    onReset,
}: DownloadButtonProps) {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        // Revoke URL on unmount for memory cleanup
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    const handleDownload = useCallback(() => {
        if (!downloadUrl) return;

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [downloadUrl, fileName]);

    return (
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <button
                id="download-button"
                onClick={handleDownload}
                disabled={!downloadUrl}
                className="
          group relative flex items-center gap-3
          px-8 py-4 rounded-xl
          bg-white text-black font-semibold text-base
          hover:bg-white/90 active:scale-[0.97]
          transition-all duration-200 ease-out
          shadow-[0_0_60px_rgba(255,255,255,0.15)]
          hover:shadow-[0_0_80px_rgba(255,255,255,0.25)]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
            >
                <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                Download PPTX
            </button>

            <button
                id="reset-button"
                onClick={onReset}
                className="
          flex items-center gap-2
          text-sm text-white/30 hover:text-white/60
          transition-colors duration-200
          py-2 px-3 rounded-lg
          hover:bg-white/[0.04]
        "
            >
                <RotateCcw className="w-3.5 h-3.5" />
                Convert another
            </button>
        </div>
    );
}
