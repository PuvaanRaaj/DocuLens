from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from typing import Dict, Any, List
import io

class DocumentService:
    def generate_docx(self, structure: Dict[str, Any]) -> io.BytesIO:
        """
        Generates a DOCX file from the structured JSON data.
        Returns the file content as a BytesIO buffer.
        """
        doc = Document()
        
        # Default style
        style = doc.styles['Normal']
        font = style.font
        font.name = 'Arial'
        font.size = Pt(11)

        elements = structure.get("elements", [])
        
        for element in elements:
            el_type = element.get("type", "paragraph")
            text = element.get("text", "")
            
            if el_type == "heading1":
                doc.add_heading(text, level=1)
            elif el_type == "heading2":
                doc.add_heading(text, level=2)
            elif el_type == "heading3":
                doc.add_heading(text, level=3)
            elif el_type == "bullet_list":
                items = element.get("items", [])
                for item in items:
                    doc.add_paragraph(item, style='List Bullet')
            elif el_type == "numbered_list":
                items = element.get("items", [])
                for item in items:
                    doc.add_paragraph(item, style='List Number')
            else:
                # Standard paragraph
                p = doc.add_paragraph(text)
                # Check for alignment if needed?
                # p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

        # Save to buffer
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        return buffer
