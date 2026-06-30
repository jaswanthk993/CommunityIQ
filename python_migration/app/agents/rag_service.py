import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# LlamaIndex modules - Using standard community structures
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding

class CityRAGService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.has_rag = False
        self.index = None
        self.query_engine = None

        if self.api_key and self.api_key != "MOCK_KEY":
            try:
                # 1. Config Gemini LLM and Text-Embedding model via LlamaIndex Settings
                Settings.llm = Gemini(
                    model="models/gemini-2.5-pro",
                    api_key=self.api_key
                )
                Settings.embed_model = GeminiEmbedding(
                    model_name="models/text-embedding-004",
                    api_key=self.api_key
                )
                self.has_rag = True
                print("CIVITAS RAG: LlamaIndex with text-embedding-004 and Gemini pipeline initialized.")
            except Exception as e:
                print(f"CIVITAS RAG FAILURE: LlamaIndex config failed (will fall back to keyword search): {e}")
                self.has_rag = False

    def build_index_from_complaints(self, complaints: List[Dict[str, Any]]):
        """
        Dynamically indexes municipal complaints (representing real relational pgvector entries)
        to make historical resolutions queryable by LLM.
        """
        if not self.has_rag or not complaints:
            return

        try:
            documents = []
            for c in complaints:
                # Build rich textual reports for indexing
                content = (
                    f"Ticket ID: {c['id']}\n"
                    f"Ward: {c['ward']}\n"
                    f"Category: {c['category']}\n"
                    f"Title: {c['title']}\n"
                    f"Report Details: {c['details']}\n"
                    f"Resolution Status: {c['status']}\n"
                    f"Assigned Priority: {c['priority']}\n"
                    f"Logged Replies & Audits: {' | '.join(c.get('replies', []))}\n"
                )
                documents.append(Document(text=content, id_=str(c["id"])))

            # Build rapid vector index
            self.index = VectorStoreIndex.from_documents(documents)
            self.query_engine = self.index.as_query_engine(similarity_top_k=2)
            print(f"CIVITAS RAG INDEX: Successfully indexed {len(complaints)} administrative records.")
        except Exception as e:
            print(f"CIVITAS RAG INDEX FAILURE: Failed to construct database vector index: {e}")

    def query_historical_knowledge(self, query_str: str) -> str:
        """
        Runs vector similarity checks or direct content fallbacks to fetch resolution templates.
        """
        if self.has_rag and self.query_engine:
            try:
                response = self.query_engine.query(query_str)
                return str(response)
            except Exception as e:
                print(f"CIVITAS RAG QUERY ERROR: {e}")
                return "Failed to evaluate vector similarity. Review API connections."
        
        # Fallback keyword matching
        query_lower = query_str.lower()
        if "waste" in query_lower or "garbage" in query_lower:
            return "Historical Context: Ward 3 and Sector 4 resolved similar commercial issues by dispatching high-capacity compactor trucks within 4 hours. Fine applied to site owner."
        elif "traffic" in query_lower or "line" in query_lower:
            return "Historical Context: Signal synchronisation lag downtown resolved by switching to adaptive green timing plans on general intersections."
        return "Historical Context: No relevant incident records matching that query was found in the archived logs."

city_rag = CityRAGService()
