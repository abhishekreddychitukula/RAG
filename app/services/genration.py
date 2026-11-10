from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)

prompt = ChatPromptTemplate.from_template("""
You are a document question-answering assistant.

Answer using ONLY the provided context.

If the answer is not available in the context,
say that you cannot find the answer in the uploaded documents.

Context:
{context}

Question:
{question}

Answer:
""")

def generate_answer(question, documents):

    context = "\n\n".join(
        document.page_content
        for document in documents
    )

    messages = prompt.format_messages(
        context=context,
        question=question
    )

    response = llm.invoke(messages)

    return response.content