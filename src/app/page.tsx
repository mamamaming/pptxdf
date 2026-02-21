"use client";

import React, { useState, useCallback } from "react";
import { FileText, Shield, Zap } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";

type AppState = "idle" | "processing" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState("presentation.pptx");
  const [progressStatus, setProgressStatus] = useState<
    "converting" | "generating"
  >("converting");

  const handleFileAccepted = useCallback(async (file: File) => {
    setState("processing");
    setCurrentPage(0);
    setTotalPages(0);
    setErrorMessage(null);
    setResultBlob(null);
    setProgressStatus("converting");
    setFileName(file.name.replace(/\.pdf$/i, "") + ".pptx");

    let hadError = false;
    let lastTotalPages = 0;

    try {
      // Read the file as ArrayBuffer
      const buffer = await file.arrayBuffer();

      // Dynamically import processing modules to reduce initial bundle size
      const { processPdf } = await import("@/lib/pdf-processor");
      const { generatePptx } = await import("@/lib/pptx-generator");

      // Process PDF pages to images
      const images = await processPdf(buffer, {
        onPageProcessed: (current, total) => {
          setCurrentPage(current);
          setTotalPages(total);
          lastTotalPages = total;
        },
        onError: (error) => {
          hadError = true;
          setErrorMessage(error);
          setState("error");
        },
      });

      // If processing returned no images (error occurred), stop
      if (images.length === 0) {
        if (!hadError) {
          setErrorMessage("Cannot access the uploaded PDF.");
          setState("error");
        }
        return;
      }

      // Generate PPTX
      setProgressStatus("generating");
      setCurrentPage(lastTotalPages);
      const blob = await generatePptx(images);

      setResultBlob(blob);
      setState("done");
    } catch {
      setErrorMessage("Cannot access the uploaded PDF.");
      setState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setState("idle");
    setCurrentPage(0);
    setTotalPages(0);
    setErrorMessage(null);
    setResultBlob(null);
    setProgressStatus("converting");
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Animated icon */}
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl animate-pulse-ring" />
            <div className="relative p-4 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl">
              <FileText className="w-8 h-8 text-white/70" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              PDF to PPTX
            </h1>
            <p className="text-sm text-white/30 max-w-xs">
              Convert your PDF to a pixel-perfect image-based PowerPoint.
              Private, fast, no servers.
            </p>
          </div>
        </div>

        {/* Main interaction area */}
        <div className="w-full">
          {state === "idle" && (
            <Dropzone
              onFileAccepted={handleFileAccepted}
              disabled={false}
            />
          )}

          {state === "processing" && (
            <ProgressBar
              currentPage={currentPage}
              totalPages={totalPages}
              status={progressStatus}
            />
          )}

          {state === "done" && resultBlob && (
            <DownloadButton
              blob={resultBlob}
              fileName={fileName}
              onReset={handleReset}
            />
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4 animate-in">
              <div className="text-center space-y-2">
                <p className="text-red-400 text-sm font-medium">
                  {errorMessage}
                </p>
              </div>
              <button
                id="try-again-button"
                onClick={handleReset}
                className="
                  text-sm text-white/40 hover:text-white/70
                  transition-colors duration-200
                  py-2 px-4 rounded-lg
                  hover:bg-white/[0.04]
                  border border-white/10 hover:border-white/20
                "
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer badges */}
        <div className="flex items-center gap-6 text-[11px] text-white/20 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            Private
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            Client-side
          </span>
        </div>
      </div>
    </main>
  );
}
