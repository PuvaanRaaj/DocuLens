"""
PDF Extractor Service — converts PDF pages into images for OCR processing.
Uses PyMuPDF (fitz) to render each page as a high-DPI PNG.
"""

import fitz  # PyMuPDF
from typing import List


class PDFExtractorService:
    """Extracts pages from a PDF as PNG images suitable for OCR."""

    DPI = 200  # Higher DPI = better OCR accuracy, but more memory
    ZOOM_FACTOR = DPI / 72  # fitz default is 72 DPI

    def extract_images(self, pdf_bytes: bytes) -> List[bytes]:
        """
        Opens a PDF from raw bytes and renders each page as a PNG image.

        Args:
            pdf_bytes: Raw bytes of the PDF file.

        Returns:
            A list of PNG image byte arrays, one per page.
        """
        images: List[bytes] = []
        matrix = fitz.Matrix(self.ZOOM_FACTOR, self.ZOOM_FACTOR)

        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                pixmap = page.get_pixmap(matrix=matrix)
                images.append(pixmap.tobytes("png"))

        return images
