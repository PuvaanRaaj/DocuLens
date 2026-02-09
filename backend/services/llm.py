import anthropic
import os
import json
from typing import Dict, Any, List
from pydantic import BaseModel

class DocumentStructure(BaseModel):
    title: str
    content: List[Dict[str, Any]] # List of paragraphs, headings, etc.

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def extract_structure(self, raw_text: str) -> Dict[str, Any]:
        """
        Sends raw OCR text to Claude to reconstruct the document structure.
        """
        
        system_prompt = """You are a document reconstruction expert. 
        Your task is to take raw OCR text from a page and reconstruct its structure into a JSON format that can be used to generate a Word document.
        
        Identify:
        - Headings (h1, h2, h3)
        - Paragraphs
        - Lists (bulleted, numbered)
        - Tables (if possible, otherwise text)
        
        Return ONLY valid JSON with this structure:
        {
            "elements": [
                {"type": "heading1", "text": "Title"},
                {"type": "paragraph", "text": "Some text..."},
                {"type": "bullet_list", "items": ["Item 1", "Item 2"]},
                {"type": "heading2", "text": "Section 2"}
            ]
        }
        """

        message = self.client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Here is the raw text:\n\n{raw_text}"}
            ]
        )

        response_text = message.content[0].text
        
        # Simple extraction of JSON
        try:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON found")
            
            json_str = response_text[start:end]
            return json.loads(json_str)
        except Exception as e:
            print(f"Error parsing Claude response: {e}")
            print(f"Response was: {response_text}")
            raise e
