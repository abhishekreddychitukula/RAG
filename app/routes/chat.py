from app.services.genration import generate_answer
from app.services.retrival import retrieve_chunks
from fastapi import APIRouter, Query

chat_router = APIRouter()

@chat_router.get("/chat")
async def chat_with_pdf(question: str, document_id: str = Query(..., min_length=1)):
    # Retrieve relevant chunks from the vector store based on the question
    relevant_chunks = retrieve_chunks(question, document_id)

    # Generate an answer using the retrieved chunks and the question
    answer = generate_answer(question, relevant_chunks)

    return {"question": question, "answer": answer}