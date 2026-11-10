from app.services.vector_store import vector_store


def retrieve_chunks(question: str, document_id: str):
    results = vector_store.similarity_search(
        query=question,
        k=4,
        filter={"document_id": document_id},
    )

    return results