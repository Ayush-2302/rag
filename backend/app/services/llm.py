from langchain_ollama import OllamaLLM
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from app.config import (
    OLLAMA_BASE_URL, 
    OLLAMA_MODEL, 
    LLM_PROVIDER, 
    GOOGLE_API_KEY, 
    GEMINI_MODEL
)
import logging

logger = logging.getLogger(__name__)

class LLMService:
    _instance = None

    @classmethod
    def get_llm(cls):
        """Returns the unified LLM instance (Ollama or Gemini) wrapped with a string parser."""
        if cls._instance is None:
            if LLM_PROVIDER.lower() == "gemini":
                logger.info(f"Initializing Gemini LLM ({GEMINI_MODEL})...")
                logger.debug(f"GOOGLE_API_KEY present: {'YES' if GOOGLE_API_KEY else 'NO'}")
                if not GOOGLE_API_KEY:
                    raise ValueError("GOOGLE_API_KEY is not set in environment.")
                llm = ChatGoogleGenerativeAI(
                    model=GEMINI_MODEL,
                    google_api_key=GOOGLE_API_KEY,
                    temperature=0
                )
            else:
                logger.info(f"Initializing Ollama LLM ({OLLAMA_MODEL})...")
                llm = OllamaLLM(
                    model=OLLAMA_MODEL, 
                    base_url=OLLAMA_BASE_URL
                )
            # Chain with StrOutputParser to ensure consistent string output
            cls._instance = llm | StrOutputParser()
        return cls._instance

    @classmethod
    def generate(cls, text: str, summarize: bool = False) -> str:
        """Generates a response or summary for a given text."""
        llm = cls.get_llm()
        prompt = f"Please summarize the following text:\n\n{text}" if summarize else text
        return llm.invoke(prompt)
