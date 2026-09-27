from pydantic import BaseModel
from typing import Optional

class QuestionRequest(BaseModel):
    question: str
    collection_name: Optional[str] = None

class QuestionWithFileRequest(BaseModel):
    query: str
    file_name: str