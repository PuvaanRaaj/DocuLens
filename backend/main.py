"""
DocuLens API — Image/PDF to Document converter.
Supports multi-file upload, PDF input, and DOCX/PDF/TXT output formats.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import os
from typing import List
from dotenv import load_dotenv
from services.ocr import OCRService
from services.llm import LLMService
from services.document import DocumentService
from services.pdf_extractor import PDFExtractorService

load_dotenv()

app = FastAPI(title="DocuLens — AI Document Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ocr_service = OCRService()
llm_service = LLMService()
doc_service = DocumentService()
pdf_extractor = PDFExtractorService()

# ── Constants ─────────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"}
ALLOWED_PDF_TYPE = "application/pdf"

OUTPUT_FORMATS = {
    "docx": {
        "method": "generate_docx",
        "media_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "extension": ".docx",
    },
    "pdf": {
        "method": "generate_pdf",
        "media_type": "application/pdf",
        "extension": ".pdf",
    },
    "txt": {
        "method": "generate_txt",
        "media_type": "text/plain; charset=utf-8",
        "extension": ".txt",
    },
}


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "DocuLens API is running"}


@app.post("/convert")
async def convert_files(
    files: List[UploadFile] = File(...),
    output_format: str = Query("docx", enum=["docx", "pdf", "txt"]),
) -> StreamingResponse:
    """
    Convert one or more images/PDFs into a single document.

    - Accepts multiple image files and/or PDF files.
    - PDFs are split into pages and each page is OCR'd.
    - All extracted text is merged into a single output document.
    - Output format is controlled via the `output_format` query parameter.
    """

    if output_format not in OUTPUT_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {output_format}")

    # ── 1. Collect all images (expand PDFs into page images) ──────────
    image_buffers: List[bytes] = []

    for uploaded_file in files:
        content_type = uploaded_file.content_type or ""
        raw_bytes = await uploaded_file.read()

        if content_type == ALLOWED_PDF_TYPE:
            print(f"[PDF] Extracting pages from: {uploaded_file.filename}")
            page_images = pdf_extractor.extract_images(raw_bytes)
            image_buffers.extend(page_images)
            print(f"[PDF] Extracted {len(page_images)} page(s)")

        elif content_type in ALLOWED_IMAGE_TYPES:
            image_buffers.append(raw_bytes)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {content_type}. Upload images or PDFs.",
            )

    if not image_buffers:
        raise HTTPException(status_code=400, detail="No valid files uploaded.")

    try:
        # ── 2. OCR each image ─────────────────────────────────────────
        merged_elements: list[dict] = []

        for idx, img_bytes in enumerate(image_buffers, 1):
            print(f"[OCR] Processing image {idx}/{len(image_buffers)}...")
            raw_text = await ocr_service.detect_text(img_bytes)

            if not raw_text:
                print(f"[OCR] No text detected in image {idx}, skipping.")
                continue

            # ── 3. Structure extraction via LLM ───────────────────────
            print(f"[LLM] Extracting structure for image {idx}...")
            structure = llm_service.extract_structure(raw_text)
            elements = structure.get("elements", [])
            merged_elements.extend(elements)

        if not merged_elements:
            raise HTTPException(
                status_code=400,
                detail="No text could be detected in any of the uploaded files.",
            )

        merged_structure = {"elements": merged_elements}

        # ── 4. Generate output document ──────────────────────────────
        fmt = OUTPUT_FORMATS[output_format]
        generate_fn = getattr(doc_service, fmt["method"])
        output_buffer = generate_fn(merged_structure)

        # Build filename from the first uploaded file
        base_name = os.path.splitext(files[0].filename or "document")[0]
        if len(files) > 1:
            base_name += f"_and_{len(files) - 1}_more"
        filename = base_name + fmt["extension"]

        print(f"[DONE] Generated {output_format.upper()}: {filename}")

        return StreamingResponse(
            output_buffer,
            media_type=fmt["media_type"],
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
