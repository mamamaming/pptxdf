import PptxGenJS from "pptxgenjs";
import type { PageImage } from "./pdf-processor";

export async function generatePptx(pages: PageImage[]): Promise<Blob> {
    const pptx = new PptxGenJS();

    if (pages.length === 0) {
        const emptyBlob = (await pptx.write({ outputType: "blob" })) as Blob;
        return new Blob([emptyBlob], {
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        });
    }

    // PDF dimensions are in points. Convert points to inches (72 points = 1 inch)
    const slideWidthInches = pages[0].width / 72;
    const slideHeightInches = pages[0].height / 72;

    // Set the presentation layout to match the first PDF page exactly
    pptx.defineLayout({ name: "CUSTOM", width: slideWidthInches, height: slideHeightInches });
    pptx.layout = "CUSTOM";

    for (const page of pages) {
        const slide = pptx.addSlide();

        // Calculate aspect ratios to fit image properly
        const pageAspect = page.width / page.height;
        const slideAspect = slideWidthInches / slideHeightInches;

        let imgWidth: number;
        let imgHeight: number;
        let imgX: number;
        let imgY: number;

        if (pageAspect > slideAspect) {
            // Page is wider than slide — fit to width
            imgWidth = slideWidthInches;
            imgHeight = slideWidthInches / pageAspect;
            imgX = 0;
            imgY = (slideHeightInches - imgHeight) / 2;
        } else {
            // Page is taller than slide — fit to height
            imgHeight = slideHeightInches;
            imgWidth = slideHeightInches * pageAspect;
            imgX = (slideWidthInches - imgWidth) / 2;
            imgY = 0;
        }

        slide.addImage({
            data: page.dataUrl,
            x: imgX,
            y: imgY,
            w: imgWidth,
            h: imgHeight,
        });
    }

    // Generate the PPTX as a Blob
    const blob = (await pptx.write({ outputType: "blob" })) as Blob;

    // Explicitly enforce the PPTX MIME type to prevent mobile browsers from appending .zip
    return new Blob([blob], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
}
