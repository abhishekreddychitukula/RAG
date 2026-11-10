from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def load_pdf(file_path: str):

    loader = PyPDFLoader(file_path)

    documents = loader.load()

    return documents

def clean_documents(documents):
    for document in documents:
        document.page_content = " ".join(
            document.page_content.split()
        )

    return documents

def split_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    splited_docs = text_splitter.split_documents(documents)

    return splited_docs

# embeddings_model = OpenAIEmbeddings(
#     model="text-embedding-3-small"
# )

def generate_embeddings(chunks):
    texts = [chunk.page_content for chunk in chunks]

    vectors = embeddings_model.embed_documents(texts)
    return vectors

