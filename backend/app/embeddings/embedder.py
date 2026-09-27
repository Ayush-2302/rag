from __future__ import annotations
from typing import List, Sequence, Union
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
from langchain_core.embeddings import Embeddings
from langchain_core.documents import Document


class NativeRecursiveTextSplitter:
    """
    Lightweight recursive text splitter that splits documents into smaller chunks
    without pulling in heavy/broken dependencies like sentence_transformers or pandas.
    """
    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 50, add_start_index: bool = True):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.add_start_index = add_start_index
        self.separators = ['\n\n', '\n', '. ', ' ', '']

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        separator = separators[-1]
        new_separators = []
        for i, s in enumerate(separators):
            if s == '' or s in text:
                separator = s
                new_separators = separators[i + 1:]
                break

        splits = text.split(separator) if separator else list(text)
        good_splits = []
        current_chunk = []
        current_len = 0

        for s in splits:
            s_len = len(s)
            sep_len = len(separator) if current_chunk else 0
            if current_len + s_len + sep_len <= self.chunk_size:
                current_chunk.append(s)
                current_len += s_len + sep_len
            else:
                if current_chunk:
                    doc_str = separator.join(current_chunk)
                    if doc_str.strip():
                        good_splits.append(doc_str)
                    
                    # Compute overlap chunk
                    overlap_chunk = []
                    overlap_len = 0
                    for prev_s in reversed(current_chunk):
                        if overlap_len + len(prev_s) <= self.chunk_overlap:
                            overlap_chunk.insert(0, prev_s)
                            overlap_len += len(prev_s)
                        else:
                            break
                    current_chunk = overlap_chunk
                    current_len = overlap_len

                if new_separators and len(s) > self.chunk_size:
                    deeper_splits = self._split_text(s, new_separators)
                    good_splits.extend(deeper_splits)
                else:
                    current_chunk.append(s)
                    current_len += s_len

        if current_chunk:
            doc_str = separator.join(current_chunk)
            if doc_str.strip():
                good_splits.append(doc_str)

        return good_splits

    def split_documents(self, documents: List[Document]) -> List[Document]:
        result = []
        for doc in documents:
            text = doc.page_content or ''
            chunks = self._split_text(text, self.separators)
            for i, chunk in enumerate(chunks):
                meta = dict(doc.metadata)
                if self.add_start_index:
                    meta['chunk_index'] = i
                result.append(Document(page_content=chunk, metadata=meta))
        return result


class BGEEmbeddings(Embeddings):
    def __init__(self, model_name: str = "BAAI/bge-large-en"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()
        self.query_instruction = "Represent this sentence for searching relevant passages: "

    def _encode(self, texts: List[str], batch_size: int = 32, max_length: int = 512) -> List[List[float]]:
        if not texts:
            return []
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            inputs = self.tokenizer(
                batch,
                padding=True,
                truncation=True,
                max_length=max_length,
                return_tensors="pt"
            )
            with torch.no_grad():
                outputs = self.model(**inputs)
                # CLS token pooling
                embeddings = outputs[0][:, 0]
                # Normalize embeddings
                embeddings = F.normalize(embeddings, p=2, dim=1)
                all_embeddings.extend(embeddings.cpu().tolist())
        return all_embeddings

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._encode(texts)

    def embed_query(self, text: str) -> List[float]:
        query_text = f"{self.query_instruction}{text}"
        res = self._encode([query_text])
        return res[0] if res else []


def split_documents(docs):
    """Splits documents into smaller chunks for vectorization."""
    text_splitter = NativeRecursiveTextSplitter(
        chunk_size=700,
        chunk_overlap=50,
        add_start_index=True
    )
    return text_splitter.split_documents(docs)


_embeddings_instance = None


def get_embeddings():
    global _embeddings_instance
    if _embeddings_instance is None:
        _embeddings_instance = BGEEmbeddings()
    return _embeddings_instance


def embed_text(text_or_texts: Union[str, Sequence[str]]) -> Union[List[float], List[List[float]]]:
    embeddings = get_embeddings()
    if isinstance(text_or_texts, str):
        return embeddings.embed_query(text_or_texts)
    else:
        return embeddings.embed_documents(list(text_or_texts))
