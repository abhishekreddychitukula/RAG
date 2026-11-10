# from operator import index

from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embeddings_model = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-2-preview"
)

vector_store = Chroma(
    collection_name="pdf_documents",
    embedding_function=embeddings_model,
    persist_directory="./storage/chroma_db"
)

def store_chunks(chunks, document_id, filename):

    for chunk in chunks:
        chunk.metadata["document_id"] = document_id
        chunk.metadata["filename"] = filename
        # chunk.metadata["chunk_index"] = index(chunk)

    vector_store.add_documents(chunks)


def list_documents():
    metadata = vector_store.get(include=["metadatas"]).get("metadatas") or []
    documents = {}

    for item in metadata:
        if not item:
            continue
        document_id = item.get("document_id")
        filename = item.get("filename")
        if document_id and filename:
            documents[document_id] = {"id": document_id, "filename": filename}

    return list(documents.values())