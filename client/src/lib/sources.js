export function isGithubUrl(value) {
  try {
    const url = new URL(value)
    return url.hostname.toLowerCase().includes("github.com")
  } catch {
    return false
  }
}

export function normalizeUploadSources(payload) {
  const rawSources = Array.isArray(payload?.data) ? payload.data.flat(Infinity) : []

  return rawSources
    .filter((source) => source && source.sourceId)
    .map((source) => ({
      sourceId: source.sourceId,
      title: source.title || "Untitled source",
      type: source.type || "document",
      totalChunks: source.totalChunks ?? 0,
    }))
}

export function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  )
}
