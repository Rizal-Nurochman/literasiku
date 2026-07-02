import { Pinecone } from '@pinecone-database/pinecone'
import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages'
import { throwError } from '~~/server/utils/apiCall'

async function getCloudEmbeddings(inputs: string | string[], hfToken: string) {
  const url = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2'
  try {
    const res = await $fetch<any>(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs })
    })
    return res
  } catch (err: any) {
    throw new Error(`Gagal memanggil Hugging Face Cloud Inference API: ${err.message}`)
  }
}

async function listBooksTool(search?: string, config?: any) {
  const url = `${config.goApiBaseUrl}/api/v1/books?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`
  try {
    const res = await $fetch<any>(url)
    const books = res?.data || []
    return JSON.stringify(books.map((b: any) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      is_digital_available: b.is_digital_available,
      physical_stock: b.physical_stock
    })))
  } catch (err: any) {
    return `Gagal mengambil daftar buku: ${err.message}`
  }
}

async function searchBookContentTool(bookId: string, query: string, config: any) {
  try {
    const embedding = await getCloudEmbeddings(query, config.huggingfaceApiKey)

    const pinecone = new Pinecone({
      apiKey: config.pineconeApiKey
    })
    const index = pinecone.index(config.pineconeIndexName)
    
    const pineconeBookId = !isNaN(Number(bookId)) ? Number(bookId) : bookId

    const result = await index
      .namespace(config.pineconeNamespace || 'default')
      .query({
        vector: Array.from(embedding),
        topK: Number(config.ragMaxReferences ?? 5),
        filter: {
          bookId: {
            $eq: pineconeBookId
          }
        },
        includeMetadata: true
      })

    const matches = result.matches.filter(
      (m) =>
        m.score !== undefined &&
        m.score >= Number(config.ragMinScore ?? 0.3)
    )

    if (!matches.length) {
      return 'Tidak ditemukan informasi relevan di dalam buku tersebut.'
    }

    return matches.map((m) => `${m.metadata?.text}\n(Sitasi: Buku ID ${bookId})`).join('\n\n---\n\n')
  } catch (err: any) {
    return `Gagal melakukan pencarian konten buku: ${err.message}`
  }
}

async function myLoansTool(session?: string, config?: any) {
  if (!session) return 'Gagal: Sesi pengguna tidak aktif. Mohon login terlebih dahulu.'
  try {
    const [physRes, digRes] = await Promise.all([
      $fetch<any>(`${config.goApiBaseUrl}/api/v1/loans/physical/my?limit=50`, {
        headers: { Authorization: `Bearer ${session}` }
      }),
      $fetch<any>(`${config.goApiBaseUrl}/api/v1/loans/digital/my?limit=50`, {
        headers: { Authorization: `Bearer ${session}` }
      })
    ])

    const physical = (physRes?.data || []).map((l: any) => ({
      buku: l.book_title,
      status: l.status,
      tanggal_pinjam: l.borrow_date,
      tenggat_kembali: l.due_date,
      denda: l.fine_amount,
      status_denda: l.fine_status
    }))

    const digital = (digRes?.data || []).map((l: any) => ({
      buku: l.book_title,
      status: l.access_status,
      tanggal_mulai: l.start_date,
      tanggal_berakhir: l.end_date
    }))

    return JSON.stringify({
      peminjaman_fisik: physical,
      peminjaman_digital: digital
    })
  } catch (err: any) {
    return `Gagal mengambil data peminjaman: ${err.message}`
  }
}

async function allLoansTool(status?: string, session?: string, config?: any) {
  if (!session) return 'Gagal: Akses ditolak. Mohon login sebagai Admin.'
  try {
    const urlPhys = `${config.goApiBaseUrl}/api/v1/loans/physical?limit=100${status ? `&status=${status}` : ''}`
    const urlDig = `${config.goApiBaseUrl}/api/v1/loans/digital?limit=100`

    const [physRes, digRes] = await Promise.all([
      $fetch<any>(urlPhys, { headers: { Authorization: `Bearer ${session}` } }),
      $fetch<any>(urlDig, { headers: { Authorization: `Bearer ${session}` } })
    ])

    const physical = (physRes?.data || []).map((l: any) => ({
      peminjam: l.user_full_name,
      username: l.username,
      buku: l.book_title,
      status: l.status,
      tanggal_pinjam: l.borrow_date,
      tenggat_kembali: l.due_date,
      denda: l.fine_amount,
      status_denda: l.fine_status
    }))

    const digital = (digRes?.data || []).map((l: any) => ({
      peminjam: l.user_full_name,
      username: l.username,
      buku: l.book_title,
      status: l.access_status,
      tanggal_mulai: l.start_date,
      tanggal_berakhir: l.end_date
    }))

    return JSON.stringify({
      semua_peminjaman_fisik: physical,
      semua_peminjaman_digital: digital
    })
  } catch (err: any) {
    return `Gagal mengambil semua data peminjaman: ${err.message}`
  }
}

async function listMembersTool(search?: string, session?: string, config?: any) {
  if (!session) return 'Gagal: Akses ditolak. Mohon login sebagai Admin.'
  try {
    const url = `${config.goApiBaseUrl}/api/v1/users?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`
    const res = await $fetch<any>(url, { headers: { Authorization: `Bearer ${session}` } })
    const users = res?.data || []
    return JSON.stringify(users.map((u: any) => ({
      id: u.id,
      nama: u.full_name,
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.status
    })))
  } catch (err: any) {
    return `Gagal mengambil daftar anggota: ${err.message}`
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.query) {
    throwError({
      statusCode: 400,
      statusMessage: 'Query is required'
    })
  }

  const session = getCookie(event, 'literasiku_session')
  const config = useRuntimeConfig(event)

  const user = await $fetch<any>(`${config.goApiBaseUrl}/api/v1/users/me`, {
    headers: {
      Authorization: session ? `Bearer ${session}` : ''
    }
  }).then(res => res.data).catch(() => null)

  if (!user) {
    throwError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Mohon masuk terlebih dahulu.'
    })
  }

  const res = event.node.res
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  const sendSSE = (type: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`)
  }

  try {
    const tools: any[] = [
      {
        type: 'function',
        function: {
          name: 'list_books',
          description: 'Mendapatkan daftar buku yang tersedia di perpustakaan. Opsional bisa difilter dengan kata kunci pencarian.',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Kata kunci pencarian judul buku' }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_book_content',
          description: 'Mencari dan membaca isi/konten dari buku digital tertentu (RAG) untuk menjawab pertanyaan spesifik tentang buku tersebut.',
          parameters: {
            type: 'object',
            properties: {
              bookId: { type: 'string', description: 'ID Buku yang ingin dicari isinya' },
              query: { type: 'string', description: 'Pertanyaan atau kata kunci pencarian dalam buku' }
            },
            required: ['bookId', 'query']
          }
        }
      }
    ]

    if (user.role === 'USER') {
      tools.push({
        type: 'function',
        function: {
          name: 'my_loans',
          description: 'Mendapatkan daftar peminjaman buku fisik dan digital milik saya saat ini.',
          parameters: { type: 'object', properties: {} }
        }
      })
    } else if (user.role === 'ADMIN') {
      tools.push({
        type: 'function',
        function: {
          name: 'all_loans',
          description: 'Mendapatkan semua daftar peminjaman buku fisik dan digital seluruh anggota di perpustakaan.',
          parameters: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Filter status peminjaman (contoh: BORROWED, OVERDUE)' }
            }
          }
        }
      })
      tools.push({
        type: 'function',
        function: {
          name: 'list_members',
          description: 'Mendapatkan daftar seluruh anggota (users) perpustakaan Literasiku.',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Pencarian nama atau email anggota' }
            }
          }
        }
      })
    }

    const historyMessages = (body.messages ?? []).map((m: any) => {
      if (m.role === 'user') return new HumanMessage(m.content)
      return new AIMessage(m.content)
    })

    const systemPrompt = `Anda adalah Lixi - Teman Membacamu, asisten perpustakaan cerdas yang menyenangkan dan ramah.
Anda membantu pengguna memahami sistem perpustakaan Literasiku dan menjawab pertanyaan mereka.
Anda memiliki akses ke tools untuk mengambil informasi real-time dari database. Gunakan tools tersebut apabila diperlukan.
Peran pengguna yang sedang berbicara dengan Anda saat ini adalah: ${user.role}.
Nama pengguna: ${user.full_name} (@${user.username}).

Aturan penting:
1. Hanya gunakan informasi yang diperoleh dari tools untuk menjawab pertanyaan mengenai buku, peminjaman, atau anggota.
2. Jika memanggil tool search_book_content, pastikan mendapatkan bookId yang valid terlebih dahulu menggunakan list_books jika belum diketahui.
3. Anda memiliki daftar rute halaman riil yang valid untuk dibuat sebagai tautan aksi Markdown. JANGAN PERNAH MENEBAK ATAU MEMBUAT RUTE LAIN di luar daftar ini:
   - Jika peran pengguna saat ini adalah USER:
     * Halaman Dashboard Utama: [/dashboard] (Gunakan label seperti [Buka Dashboard](/dashboard))
     * Halaman Katalog Buku: [/dashboard/katalog] (Gunakan label seperti [Lihat Katalog Buku](/dashboard/katalog))
     * Halaman Detail Buku Spesifik: [/dashboard/katalog/<bookId>] (Gunakan label seperti [Lihat Detail Buku](/dashboard/katalog/<bookId>) - pastikan <bookId> berupa ID angka yang valid dari database)
     * Halaman Riwayat Peminjaman: [/dashboard/riwayat] (Gunakan label seperti [Lihat Riwayat Peminjaman](/dashboard/riwayat))
     * Halaman Membaca Buku Digital: [/dashboard/riwayat/baca/<bookId>] (Gunakan label seperti [Baca Buku Digital](/dashboard/riwayat/baca/<bookId>))
     * Halaman Profil Akun: [/dashboard/profil] (Gunakan label seperti [Buka Profil Saya](/dashboard/profil))
   - Jika peran pengguna saat ini adalah ADMIN:
     * Halaman Dashboard Admin: [/admin] (Gunakan label seperti [Buka Dashboard Admin](/admin))
     * Halaman Kelola Buku: [/admin/buku] (Gunakan label seperti [Kelola Buku](/admin/buku))
     * Halaman Kelola Anggota: [/admin/anggota] (Gunakan label seperti [Kelola Anggota](/admin/anggota))
     * Halaman Kelola Kategori Buku: [/admin/kategori] (Gunakan label seperti [Kelola Kategori](/admin/kategori))
     * Halaman Kelola Transaksi Peminjaman: [/admin/peminjaman] (Gunakan label seperti [Kelola Peminjaman](/admin/peminjaman))
     * Halaman Kelola Denda Anggota: [/admin/denda] (Gunakan label seperti [Kelola Denda](/admin/denda))
     * Halaman Laporan & Statistik: [/admin/laporan] (Gunakan label seperti [Lihat Laporan](/admin/laporan))
4. Anda harus selalu menyertakan teks sitasi secara eksplisit (contoh: "(Sitasi: Buku ID <bookId>)") pada bagian akhir atau bagian relevan dari jawaban Anda jika menggunakan informasi dari isi buku (RAG system).
5. Jawab pertanyaan dengan ramah dan profesional dalam Bahasa Indonesia.`

    const messages: any[] = [
      new SystemMessage(systemPrompt),
      ...historyMessages,
      new HumanMessage(body.query)
    ]

    const llm = new ChatOpenAI({
      apiKey: String(config.flazApiKey),
      model: String(config.llmModel),
      configuration: {
        baseURL: String(config.flazBaseUrl)
      }
    }).bind({
      tools: tools
    })

    let loopCount = 0
    const maxLoops = 5

    while (loopCount < maxLoops) {
      const response = await llm.invoke(messages)

      const toolCalls = response.additional_kwargs?.tool_calls
      if (toolCalls && toolCalls.length > 0) {
        messages.push(response)
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}')

          sendSSE('log', { tool: toolName, args: toolArgs, status: 'running' })

          let toolOutput = ''
          try {
            if (toolName === 'list_books') {
              toolOutput = await listBooksTool(toolArgs.search, config)
            } else if (toolName === 'search_book_content') {
              toolOutput = await searchBookContentTool(toolArgs.bookId, toolArgs.query, config)
            } else if (toolName === 'my_loans' && user.role === 'USER') {
              toolOutput = await myLoansTool(session, config)
            } else if (toolName === 'all_loans' && user.role === 'ADMIN') {
              toolOutput = await allLoansTool(toolArgs.status, session, config)
            } else if (toolName === 'list_members' && user.role === 'ADMIN') {
              toolOutput = await listMembersTool(toolArgs.search, session, config)
            } else {
              toolOutput = `Error: Tool ${toolName} tidak dapat dijalankan atau akses ditolak.`
            }
          } catch (err: any) {
            toolOutput = `Error: ${err.message}`
          }

          sendSSE('log', { tool: toolName, status: 'done' })

          messages.push(new ToolMessage({
            content: toolOutput,
            tool_call_id: toolCall.id
          }))
        }
        loopCount++
      } else {
        break
      }
    }

    const finalLlm = new ChatOpenAI({
      apiKey: String(config.flazApiKey),
      model: String(config.llmModel),
      configuration: {
        baseURL: String(config.flazBaseUrl)
      }
    })

    const stream = await finalLlm.stream(messages)
    for await (const chunk of stream) {
      const token = chunk.content
      const additional = chunk.additional_kwargs as any
      const reasoning = additional?.reasoning_content || additional?.thinking || ''

      if (reasoning) {
        sendSSE('reasoning', { token: reasoning })
      }
      if (token) {
        sendSSE('token', { token })
      }
    }
    sendSSE('done', {})
  } catch (err: any) {
    sendSSE('error', { message: err.message || 'Internal Server Error' })
  } finally {
    res.end()
  }
})
