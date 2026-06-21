# Literasiku - Digital Library with AI Agent

Literasiku adalah web digital library berbasis Nuxt dengan DeepSeek-powered AI Agent, RAG ke Pinecone, PDF indexing, memory, semantic routing, native SSE, dan NotebookLM-style hover references.

## Stack

- Nuxt 4
- Nuxt UI
- Vercel AI SDK
- `@ai-sdk/deepseek`
- Pinecone Vector DB
- Native SSE
- PDF RAG
- NotebookLM-style citation UI
- Yarn

## Setup

```bash
yarn install
cp .env.example .env
yarn dev
```

Isi `.env` dengan DeepSeek, embedding provider, dan Pinecone key. API key hanya dipakai server-side.

## Environment

```env
NUXT_DEEPSEEK_API_KEY=
NUXT_DEEPSEEK_FAST_MODEL=deepseek-v4-flash
NUXT_DEEPSEEK_THINKING_MODEL=deepseek-v4-pro
NUXT_AI_DEFAULT_MODE=fast
NUXT_AI_GATEWAY_API_KEY=
NUXT_AI_EMBEDDING_MODEL=openai/text-embedding-3-small
NUXT_PINECONE_API_KEY=
NUXT_PINECONE_INDEX_NAME=literasiku
NUXT_PINECONE_NAMESPACE=default
NUXT_PINECONE_MEMORY_NAMESPACE=memory
NUXT_MEMORY_ENABLED=true
NUXT_RAG_MIN_SCORE=0.3
NUXT_RAG_MAX_REFERENCES=8
```

## Commands

```bash
yarn install
yarn dev
yarn lint
yarn typecheck
yarn build
yarn preview
```

## Model Routing

- `deepseek-v4-flash`: mode `fast`, chat harian, RAG ringan, ringkasan singkat.
- `deepseek-v4-pro`: mode `thinking`, analisis PDF panjang, planning, debugging, evaluasi, dan ReAct task kompleks.
- `auto`: memakai `semanticRoute` untuk memilih fast/thinking.

Embedding tetap dipisah dari chat model. Jika DeepSeek tidak menyediakan embedding, server memakai embedding provider yang dikonfigurasi melalui AI SDK Gateway.

## Endpoints

- `POST /api/ai`: AI SDK UI stream dengan `data-route`, `data-references`, `data-memory`, dan text parts.
- `GET /api/ai-sse`: native `text/event-stream` dengan event `start`, `route`, `references`, `context`, `memory`, `delta`, `done`, `error`.
- `POST /api/embeddings`: indexing dokumen/chunk ke Pinecone.
- `POST /api/pdf/index`: upload PDF atau PDF text, extract/chunk/embed/upsert ke Pinecone.
- `GET /api/pdf/status?sourceId=...`: status index PDF.
- `POST /api/memory/upsert`: simpan memory eksplisit.
- `GET /api/memory/search`: semantic search memory.
- `DELETE /api/memory/delete?id=...`: hapus memory.
- `GET /api/health`: status konfigurasi.

## Index Dokumen

```bash
curl -X POST http://localhost:3000/api/embeddings \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceId": "book-123",
    "title": "Belajar Literasi Digital",
    "content": "Literasi digital adalah kemampuan memahami, mengevaluasi, dan menggunakan informasi digital secara bertanggung jawab.",
    "metadata": { "author": "Tim Literasiku", "category": "edukasi", "page": 1 }
  }'
```

## Index PDF

JSON text:

```bash
curl -X POST http://localhost:3000/api/pdf/index \
  -H 'Content-Type: application/json' \
  -d '{
    "sourceId": "pdf-123",
    "title": "Materi Literasi Digital",
    "fileName": "materi-literasi.pdf",
    "text": "Isi teks PDF yang sudah diekstrak..."
  }'
```

Multipart upload:

```bash
curl -X POST http://localhost:3000/api/pdf/index \
  -F sourceId=pdf-123 \
  -F title='Materi Literasi Digital' \
  -F file=@materi-literasi.pdf
```

## Chat RAG

```bash
curl -X POST http://localhost:3000/api/ai \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [{ "id": "msg-1", "role": "user", "parts": [{ "type": "text", "text": "Ringkas PDF ini berdasarkan data library" }] }],
    "mode": "auto",
    "useRag": true,
    "useMemory": true,
    "useSkills": true,
    "includeReferences": true,
    "topK": 5
  }'
```

Jawaban RAG dapat berisi marker seperti `⟦S1⟧`. Frontend merender marker itu sebagai chip hover yang menampilkan quote asli, title/fileName, page jika tersedia, chunk index, dan score. Jika marker tidak ada di structured references, UI mengabaikannya.

## Native SSE

```js
const source = new EventSource('/api/ai-sse?q=' + encodeURIComponent('Apa inti PDF ini?') + '&mode=auto&includeReferences=true')

source.addEventListener('route', event => console.log('route', JSON.parse(event.data)))
source.addEventListener('references', event => console.log('references', JSON.parse(event.data)))
source.addEventListener('delta', event => console.log(JSON.parse(event.data).text))
source.addEventListener('done', event => {
  console.log('done', JSON.parse(event.data))
  source.close()
})
source.addEventListener('error', event => {
  console.error('SSE error', event)
  source.close()
})
```

Contoh `references` event:

```txt
event: references
data: {"items":[{"referenceId":"S1","sourceId":"pdf-123","title":"Materi Literasi Digital","fileName":"materi-literasi.pdf","mimeType":"application/pdf","page":3,"chunkIndex":8,"score":0.89,"quote":"potongan teks asli dari PDF...","preview":"ringkasan pendek..."}]}
```

## Memory

Memory disimpan hanya jika user eksplisit memakai kata seperti `ingat`, `simpan`, `remember`, `catat`, atau `mulai sekarang`.

```bash
curl -X POST http://localhost:3000/api/memory/upsert \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "user-123",
    "type": "preference",
    "content": "Ingat, saya suka jawaban bertahap dan contoh singkat.",
    "metadata": { "source": "chat", "importance": 0.8 }
  }'
```

## Pinecone Notes

Buat Pinecone index terlebih dahulu dengan dimensi yang sesuai model embedding `NUXT_AI_EMBEDDING_MODEL`. Aplikasi tidak membuat index otomatis saat runtime. Library/PDF memakai `NUXT_PINECONE_NAMESPACE`, memory memakai `NUXT_PINECONE_MEMORY_NAMESPACE`.

Jika PDF belum di-index, AI harus mengatakan PDF belum tersedia di knowledge base. Jika page metadata tidak tersedia, UI menampilkan “Halaman tidak tersedia” dan tidak mengarang nomor halaman.
