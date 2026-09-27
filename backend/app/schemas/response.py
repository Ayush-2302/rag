from pydantic import BaseModel
from typing import List, Optional

class Source(BaseModel):
    content: str
    metadata: Optional[dict] = None

class AnswerResponse(BaseModel):
    query: Optional[str] = None
    answer: str
    sources: Optional[List[Source]] = None

class PdfAnswerResponse(BaseModel):
    query: str
    answer: str
    sources: List[Source]