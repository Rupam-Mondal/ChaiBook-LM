# 📚 ChaiBook LM

An AI-powered document intelligence platform inspired by Google's NotebookLM. Upload documents or links, ask natural language questions, and receive context-aware answers powered by Retrieval-Augmented Generation (RAG).

- [Demo](https://chai-book-lm-liart.vercel.app/)

## ✨ Features

- 📄 Upload multiple document types
- 🌐 Upload website links
- ▶️ Upload YouTube videos
- 📑 Upload PDF URLs
- 🔍 Advanced Retrieval-Augmented Generation (RAG)
- 🧠 OpenAI Embeddings (`text-embedding-3-small`)
- ⚡ Vector Search using Qdrant
- 📦 MongoDB for metadata storage
- ✂️ Automatic document chunking
- 🎯 Source-specific document retrieval
- ⏱️ Timestamp-aware answers for YouTube, VTT and SRT files
- 💬 Natural language question answering

# 🚀 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Shadcn UI
- Axios

## Backend

- Node.js
- Express.js

## AI

- OpenAI
- LangChain
- Qdrant

## Database

- MongoDB


# 📁 Supported Sources

| Source | Supported |
|----------|:---------:|
| PDF | ✅ |
| DOCX | ✅ |
| PPTX | ✅ |
| TXT | ✅ |
| VTT | ✅ |
| SRT | ✅ |
| Website URL | ✅ |
| YouTube URL | ✅ |
| PDF URL | ✅ |

# 🏗️ Architecture

```
                 Upload File / Link
                         │
                         ▼
                 Source Identification
                         │
                         ▼
                   File Parser
                         │
                         ▼
                Text Extraction
                         │
                         ▼
              Recursive Chunking
                         │
                         ▼
              OpenAI Embeddings
                         │
                         ▼
                    Qdrant DB
                         │
                         ▼
                Similarity Search
                         │
                         ▼
              Retrieved Context
                         │
                         ▼
                  OpenAI GPT
                         │
                         ▼
                     Response
```

# 🧠 RAG Pipeline

```
Document
      │
      ▼
Parser
      │
      ▼
Text Extraction
      │
      ▼
Chunking
      │
      ▼
OpenAI Embeddings
      │
      ▼
Qdrant Vector Database
      │
      ▼
Similarity Search
      │
      ▼
Retrieved Context
      │
      ▼
GPT Response
```

# ⚙️ Environment Variables

## Backend

```env
OPENAI_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
MONGODB_URI=
```

## Frontend

```env
VITE_BACKEND_URL=
```

# 📦 Installation

## Clone Repository

```bash
git clone <repository-url>
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

# ⚠️ Known Limitations

- Some YouTube videos may block transcript extraction due to rate limiting or CAPTCHA.
- Very large documents may take longer to process.
- Retrieval quality depends on document content and chunking.