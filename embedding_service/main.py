from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()

# Use the 768-dim model
MODEL_NAME = "sentence-transformers/all-mpnet-base-v2"
EMBEDDING_DIM = 768
CHUNK_SIZE = 256  # Number of words per chunk (tune as needed)
model = SentenceTransformer(MODEL_NAME)

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: List[float]
    chunks: int

@app.post("/embed", response_model=EmbeddingResponse)
def embed_text(req: EmbeddingRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is empty.")

    # Chunking: split text into chunks of CHUNK_SIZE words
    words = text.split()
    if len(words) > CHUNK_SIZE:
        chunks = [" ".join(words[i:i+CHUNK_SIZE]) for i in range(0, len(words), CHUNK_SIZE)]
    else:
        chunks = [text]

    # Get embeddings for each chunk
    try:
        embeddings = model.encode(chunks, show_progress_bar=False)
        if isinstance(embeddings, list):
            embeddings = np.array(embeddings)
        avg_embedding = np.mean(embeddings, axis=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding model error: {str(e)}")

    # Ensure correct dimension
    if avg_embedding.shape[0] != EMBEDDING_DIM:
        raise HTTPException(status_code=500, detail=f"Embedding dimension mismatch: {avg_embedding.shape[0]}")
    return EmbeddingResponse(embedding=avg_embedding.tolist(), chunks=len(chunks))
