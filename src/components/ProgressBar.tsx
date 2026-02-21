"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
    currentPage: number;
    totalPages: number;
    status: "converting" | "generating";
}

export default function ProgressBar({
    currentPage,
    totalPages,
    status,
}: ProgressBarProps) {
    const percentage =
        totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

    return (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Status text */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5 text-white/70">
                    <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                    <span>
                        {status === "converting"
                            ? `Processing page ${currentPage} of ${totalPages}...`
                            : "Generating PPTX..."}
                    </span>
                </div>
                <span className="text-white/40 font-mono text-xs tabular-nums">
                    {percentage}%
                </span>
            </div>

            {/* Progress bar track */}
            <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                {/* Progress fill */}
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${percentage}%`,
                        background:
                            "linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s ease-in-out infinite",
                    }}
                />

                {/* Glow at the leading edge */}
                <div
                    className="absolute inset-y-0 rounded-full transition-all duration-500 ease-out"
                    style={{
                        left: `${Math.max(0, percentage - 2)}%`,
                        width: "12px",
                        background:
                            "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 100%)",
                        filter: "blur(4px)",
                        opacity: percentage > 0 ? 1 : 0,
                    }}
                />
            </div>
        </div>
    );
}
