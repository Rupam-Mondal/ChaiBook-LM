import axios from "axios"

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

export const api = axios.create({
  baseURL: backendURL,
})

export async function uploadSource({ mode, link, files }) {
  const formData = new FormData()

  if (mode === "link") {
    formData.append("source", link)
  } else {
    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })
  }

  const response = await api.post("/docs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function askQuestion({ docID, question }) {
  const response = await api.post("/askquestion/question", {
    docID,
    question,
  })

  return response.data
}
