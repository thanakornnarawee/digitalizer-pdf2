import { createWorker } from "tesseract.js"; 
import { PDFDocument } from "pdf-lib";

export async function processPDF(file: File, onProgress: (msg: string) => void) {
  // 1. ป้องกันการรันบน Server (Vercel Build Fix)
  if (typeof window === "undefined") return;

  // 2. โหลด PDF.js แบบ Dynamic
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const outputPDF = await PDFDocument.create();
  
  // 3. เริ่มต้น AI Worker
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress(`ระบบ AI: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  try {
    const isImage = file.type.startsWith("image/");

    if (isImage) {
      // --- กรณีอัปโหลดเป็นรูปภาพ ---
      const imgBytes = new Uint8Array(await file.arrayBuffer());
      const image = file.type === "image/png" 
        ? await outputPDF.embedPng(imgBytes) 
        : await outputPDF.embedJpg(imgBytes);

      const pdfPage = outputPDF.addPage([image.width, image.height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

      const result = await worker.recognize(file) as any;
      const data = result.data;
      
      if (data && data.words) {
        data.words.forEach((word: any) => {
          pdfPage.drawText(word.text, {
            x: word.bbox.x0,
            y: image.height - word.bbox.y1,
            size: Math.max(word.bbox.y1 - word.bbox.y0, 2),
            opacity: 0,
          });
        });
      }
    } else {
      // --- กรณีอัปโหลดเป็นไฟล์ PDF ---
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        onProgress(`กำลังประมวลผลหน้าที่ ${i} จาก ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF หน้าปัจจุบันลง Canvas
        await (page as any).render({ 
          canvasContext: ctx, 
          viewport: viewport,
          canvas: canvas 
        }).promise;

        const pdfResult = await worker.recognize(canvas) as any;
        const pdfData = pdfResult.data;

        const imgBytes = await new Promise<Uint8Array>((resolve) => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const buf = await blob.arrayBuffer();
              resolve(new Uint8Array(buf));
            }
          }, "image/png");
        });

        const image = await outputPDF.embedPng(imgBytes);
        const pdfPage = outputPDF.addPage([image.width, image.height]);
        pdfPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

        if (pdfData && pdfData.words) {
          pdfData.words.forEach((word: any) => {
            pdfPage.drawText(word.text, {
              x: word.bbox.x0,
              y: image.height - word.bbox.y1,
              size: Math.max(word.bbox.y1 - word.bbox.y0, 2),
              opacity: 0,
            });
          });
        }
      }
    }

    // 4. สรุปผลและบันทึกไฟล์
    await worker.terminate();
    return await outputPDF.save();

  } catch (err) {
    if (worker) await worker.terminate();
    console.error("OCR Error:", err);
    throw err;
  }
}