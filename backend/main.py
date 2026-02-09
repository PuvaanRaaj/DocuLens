from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import os
from dotenv import load_dotenv
from services.ocr import OCRService
from services.llm import LLMService
from services.document import DocumentService

load_dotenv()

app = FastAPI(title="Image to Docx Converter")

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

@app.get("/")
def read_root():
    return {"message": "Image to Docx Converter API is running"}

@app.post("/convert")
async def convert_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        content = await file.read()
        
        # 1. OCR
        print(f"Processing image: {file.filename}")
        raw_text = await ocr_service.detect_text(content)
        if not raw_text:
            raise HTTPException(status_code=400, detail="No text detected in image")
        
        print("OCR completed. Extracting structure...")
        
        # 2. Structure Extraction (LLM)
        structure = llm_service.extract_structure(raw_text)
        print("Structure extracted. Generating DOCX...")
        
        # 3. Generate DOCX
        docx_buffer = doc_service.generate_docx(structure)
        
        filename = os.path.splitext(file.filename)[0] + ".docx"
        
        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
