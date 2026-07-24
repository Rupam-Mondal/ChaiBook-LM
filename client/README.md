# 📡 API Endpoints

## Upload Documents / Links

Uploads supported files or links, parses the content, chunks it, generates embeddings, and stores them for retrieval.

### Endpoint

```http
POST /docs/upload
```

### Content Type

```text
multipart/form-data
```

### Form Data

| Key | Type | Description |
|-----|------|-------------|
| `source` | Text | Upload any link. (if link is pasted use this)
|`files` | file | upload file (if files pasted use this)

### Supported Sources

- 📄 PDF
- 📝 DOCX
- 📊 PPTX
- 📃 TXT
- 🎬 VTT
- 🎞️ SRT
- ▶️ YouTube URL
- 🌐 Website URL
- github url

### Success Response

```json
{
  "success": true,
  "message": "document uploaded successfully",
  "data": [
    [
      {
        "sourceId": "9adb3099-7424-4f43-9316-a612316d273b",
        "title": "YouTube Video",
        "type": "youtube",
        "totalChunks": 4
      }
    ]
  ]
}
```

> **Note:** Save the returned `sourceId`. It is required for asking questions about the uploaded document.

---

## Ask Questions

Ask questions about an uploaded document using its `sourceId`.

### Endpoint

```http
POST /askquestion/question
```

### Content Type

```text
application/json
```

### Request Body

```json
{
  "question": "mention the time stamp when author shouted to mr beast",
  "docID": "9adb3099-7424-4f43-9316-a612316d273b"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `question` | String | Your question about the uploaded document. |
| `docID` | String | The `sourceId` returned from the upload endpoint. |

### Success Response

```json
{
  "success": true,
  "message": "Answer given successfully",
  "data": "The author addresses MrBeast with a shout-out at the timestamp 00:00:49 in the video."
}
```

### Features

- 💬 Natural language question answering
- ⏱️ Timestamp-aware answers for YouTube, VTT, and SRT files
- 📚 Retrieval-Augmented Generation (RAG) powered responses
- 🎯 Source-specific retrieval using the uploaded document ID