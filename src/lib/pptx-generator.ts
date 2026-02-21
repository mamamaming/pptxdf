import PptxGenJS from "pptxgenjs";
import type { PageImage } from "./pdf-processor";

// Standard slide dimensions in inches (16:9 widescreen)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 5.625;

export async function generatePptx(pages: PageImage[]): Promise<Blob> {
    const pptx = new PptxGenJS();

    // Set the presentation to widescreen 16:9
    pptx.defineLayout({ name: "CUSTOM", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
    pptx.layout = "CUSTOM";

    for (const page of pages) {
        const slide = pptx.addSlide();

        // Calculate aspect ratios to fit image properly
        const pageAspect = page.width / page.height;
        const slideAspect = SLIDE_WIDTH / SLIDE_HEIGHT;

        let imgWidth: number;
        let imgHeight: number;
        let imgX: number;
        let imgY: number;

        if (pageAspect > slideAspect) {
            // Page is wider than slide — fit to width
            imgWidth = SLIDE_WIDTH;
            imgHeight = SLIDE_WIDTH / pageAspect;
            imgX = 0;
            imgY = (SLIDE_HEIGHT - imgHeight) / 2;
        } else {
            // Page is taller than slide — fit to height
            imgHeight = SLIDE_HEIGHT;
            imgWidth = SLIDE_HEIGHT * pageAspect;
            imgX = (SLIDE_WIDTH - imgWidth) / 2;
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
    return blob;
}
