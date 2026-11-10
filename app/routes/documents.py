from fastapi import APIRouter

from app.services.vector_store import list_documents

documents_router = APIRouter()


@documents_router.get("/documents")
async def get_documents():
    return {"documents": list_documents()}
