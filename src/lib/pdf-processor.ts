import * as pdfjsLib from "pdfjs-dist";

// Configure pdf.js worker — served from /public
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export interface PageImage {
    dataUrl: string;
    width: number;
    height: number;
}

export interface ProcessingCallbacks {
    onPageProcessed: (currentPage: number, totalPages: number) => void;
    onError: (error: string) => void;
}

const RENDER_SCALE = 2; // 2x for high quality images

export async function processPdf(
    fileBuffer: ArrayBuffer,
    callbacks: ProcessingCallbacks
): Promise<PageImage[]> {
    const images: PageImage[] = [];

    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    try {
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(fileBuffer),
            useSystemFonts: true,
        });

        pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        // Process pages sequentially to minimize memory usage
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: RENDER_SCALE });

            // Create an offscreen canvas
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("Failed to get canvas 2D context.");
            }

            // Render the page (pdf.js v5 requires the canvas element)
            await page.render({
                canvasContext: ctx,
                viewport: viewport,
                canvas: canvas,
            }).promise;

            // Extract image data
            const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

            images.push({
                dataUrl,
                // Store original (non-scaled) dimensions in inches for PPTX
                // PDF units are 72 DPI, viewport is scaled
                width: viewport.width / RENDER_SCALE,
                height: viewport.height / RENDER_SCALE,
            });

            // Memory cleanup: clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;

            // Cleanup page resources
            page.cleanup();

            // Report progress
            callbacks.onPageProcessed(pageNum, totalPages);
        }
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Unknown error occurred";

        // Detect password-protected or corrupted PDFs
        if (
            message.includes("password") ||
            message.includes("encrypted") ||
            message.includes("Invalid PDF") ||
            message.includes("Missing PDF")
        ) {
            callbacks.onError("Cannot access the uploaded PDF.");
        } else {
            callbacks.onError("Cannot access the uploaded PDF.");
        }

        return [];
    } finally {
        // Cleanup PDF document
        if (pdfDoc) {
            pdfDoc.destroy();
        }
    }

    return images;
}
