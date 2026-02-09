from google.cloud import vision
import io
import os
from fastapi import UploadFile

class OCRService:
    def __init__(self):
        # Implicitly uses GOOGLE_APPLICATION_CREDENTIALS
        self.client = vision.ImageAnnotatorClient()

    async def detect_text(self, file_content: bytes) -> str:
        """
        Detects text in an image file using Google Cloud Vision API.
        Returns the full text detected.
        """
        image = vision.Image(content=file_content)

        response = self.client.text_detection(image=image)
        texts = response.text_annotations

        if response.error.message:
            raise Exception(
                '{}\nFor more info on error messages, check: '
                'https://cloud.google.com/apis/design/errors'.format(
                    response.error.message))

        if not texts:
            return ""

        # The first annotation contains the full text
        return texts[0].description
