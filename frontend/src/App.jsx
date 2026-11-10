import { useEffect, useRef, useState } from "react";
import "../styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const suggestions = [
  ["✦", "Summarize", "Get the main points at a glance", "Give me a concise summary of this document"],
  ["⌁", "Find key facts", "Surface the details that matter", "What are the most important facts in this document?"],
  ["☷", "Explain simply", "Make complex ideas easier to follow", "Explain this document in simple terms"],
];

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6.5 3.75h7.25L18 8v12.25H6.5V3.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.75 3.75V8H18" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("papertrail-theme") === "dark");
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [documentState, setDocumentState] = useState({ name: "No document yet", status: "Upload a PDF to get started", ready: false });
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const toastTimer = useRef();

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("papertrail-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    fetch(`${API_BASE}/documents`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Unable to load documents.");
        setDocuments(data.documents || []);
      })
      .catch((error) => showToast(error.message));
  }, []);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  const askQuestion = async (value) => {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion || isSending) return;
    if (!selectedDocument) {
      showToast("Upload or select a PDF before asking a question.");
      return;
    }
    setIsSending(true);
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: trimmedQuestion }, { role: "assistant", loading: true }]);
    try {
      const response = await fetch(`${API_BASE}/chat?question=${encodeURIComponent(trimmedQuestion)}&document_id=${encodeURIComponent(selectedDocument.id)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "The question could not be answered.");
      setMessages((current) => [...current.slice(0, -1), { role: "assistant", text: data.answer || "I couldn't find an answer in the document." }]);
    } catch (error) {
      setMessages((current) => current.slice(0, -1));
      showToast(error.message || "Unable to connect to the API.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const uploadPdf = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please choose a PDF file.");
      return;
    }
    setDocumentState({ name: file.name, status: "Uploading…", ready: false });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed.");
      const uploadedDocument = { id: data.document_id, filename: data.filename || file.name };
      setDocuments((current) => [uploadedDocument, ...current.filter((item) => item.id !== uploadedDocument.id)]);
      setSelectedDocument(uploadedDocument);
      setDocumentState({ name: uploadedDocument.filename, status: "Ready to chat", ready: true });
      showToast("Document is ready.");
    } catch (error) {
      setDocumentState({ name: "No document yet", status: "Upload a PDF to get started", ready: false });
      showToast(error.message || "Unable to upload the document.");
    }
  };

  const selectDocument = (item) => {
    setSelectedDocument(item);
    setDocumentState({ name: item.filename, status: "Ready to chat", ready: true });
    setMessages([]);
    setMenuOpen(false);
  };

  const startNewChat = () => {
    setSelectedDocument(null);
    setDocumentState({ name: "No document yet", status: "Upload a PDF to get started", ready: false });
    setMessages([]);
    setQuestion("");
    setMenuOpen(false);
  };

  const handleInput = (event) => {
    setQuestion(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 130)}px`;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Conversation sidebar">
        <div className="sidebar-top">
          <a className="brand" href="#" aria-label="Papertrail home">
            <span className="brand-mark" aria-hidden="true"><DocumentIcon /></span>
            <span>papertrail</span>
          </a>
          <button className="new-chat-button" type="button" onClick={startNewChat}>
            <span className="plus-icon" aria-hidden="true">+</span> New chat <span className="shortcut">⌘ K</span>
          </button>
        </div>
        <div className="sidebar-section">
          <p className="section-label">Your workspace</p>
          <div className="document-card">
            <div className="document-icon" aria-hidden="true"><DocumentIcon /></div>
            <div className="document-meta"><strong>{documentState.name}</strong><span>{documentState.status}</span></div>
            <span className={`status-dot ${documentState.ready ? "ready" : ""}`} />
          </div>
          <label className="upload-button" htmlFor="fileInput">
            <span aria-hidden="true">↑</span> Upload PDF
          </label>
          <input id="fileInput" type="file" accept=".pdf,application/pdf" hidden onChange={(event) => uploadPdf(event.target.files[0])} />
        </div>
        <div className="sidebar-section documents-section">
          <p className="section-label">Your PDFs</p>
          <div className="document-list">
            {documents.length === 0 ? <span className="empty-documents">No PDFs uploaded yet</span> : documents.map((item) => (
              <button className={`document-item ${selectedDocument?.id === item.id ? "selected" : ""}`} type="button" key={item.id} onClick={() => selectDocument(item)}>
                <span className="document-item-icon"><DocumentIcon /></span>
                <span>{item.filename}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-bottom">
          <button className="sidebar-link" type="button" onClick={() => setDark((value) => !value)}>
            <span className="theme-icon" aria-hidden="true">◐</span><span>{dark ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="profile"><span className="avatar">AR</span><span className="profile-name">My workspace</span><span className="more-icon">•••</span></div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><button className="icon-button mobile-menu" type="button" aria-label="Open menu" onClick={() => setMenuOpen((value) => !value)}>☰</button><span>papertrail</span></div>
          <div className="topbar-title">Document chat <span className="beta-pill">BETA</span></div>
          <button className="icon-button" type="button" aria-label="Toggle theme" onClick={() => setDark((value) => !value)}>◐</button>
        </header>
        <section className="conversation" aria-live="polite">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-mark"><DocumentIcon /></div>
              <p className="eyebrow">Your documents, understood</p>
              <h1>What would you like to know?</h1>
              <p className="welcome-copy">{selectedDocument ? `Ask anything about ${selectedDocument.filename}.` : "Upload a PDF, then ask anything. Papertrail only uses the selected document to answer."}</p>
              <div className="suggestion-grid">
                {suggestions.map(([icon, title, copy, prompt]) => <button className="suggestion-card" type="button" key={title} onClick={() => askQuestion(prompt)}><span className="suggestion-icon">{icon}</span><span><strong>{title}</strong><small>{copy}</small></span><span className="arrow">↗</span></button>)}
              </div>
            </div>
          ) : messages.map((message, index) => (
            <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="message-avatar">{message.role === "user" ? "AR" : "P"}</div>
              <div><div className="message-label">{message.role === "user" ? "You" : "Papertrail"}</div><div className="message-body">{message.loading ? <span className="loading-dots">•••</span> : message.text}</div></div>
            </article>
          ))}
        </section>
        <div className="composer-wrap">
          <div className="composer">
            <textarea ref={inputRef} rows="1" value={question} onChange={handleInput} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); askQuestion(question); } }} placeholder="Ask a question about your document…" aria-label="Question" />
            <div className="composer-actions">
              <label className="attach-button" htmlFor="fileInput" aria-label="Upload PDF" title="Upload PDF">＋</label>
              <span className="composer-hint">Papertrail can make mistakes. Check important info.</span>
              <button className="send-button" type="button" aria-label="Send question" disabled={isSending} onClick={() => askQuestion(question)}>
                <svg viewBox="0 0 24 24" fill="none"><path d="m5 12 14-7-3.5 14-3.25-6.25L5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="m12.25 12.75 6.75-7.25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
      <div className={`toast ${toast ? "visible" : ""}`} role="status">{toast}</div>
    </div>
  );
}

export default App;
