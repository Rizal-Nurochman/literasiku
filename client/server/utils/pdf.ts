import { PDFParse } from 'pdf-parse'

type PdfPage = {
  page?: number
  text: string
}

export function normalizePdfText(text: string) {
  return text.replace(new RegExp(String.fromCharCode(0), 'g'), '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

export function splitPdfByPage(text: string): PdfPage[] {
  const normalized = normalizePdfText(text)
  const pageBreakParts = normalized.split(/\f+/).map(page => page.trim()).filter(Boolean)

  if (pageBreakParts.length > 1) {
    return pageBreakParts.map((page, index) => ({ page: index + 1, text: page }))
  }

  return [{ text: normalized }]
}

export async function extractPdfText(buffer: Buffer): Promise<{ text: string, pages: PdfPage[] }> {
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()
    const text = normalizePdfText(result.text ?? '')
    const pages = result.pages?.length
      ? result.pages.map(page => ({ page: page.num, text: normalizePdfText(page.text ?? '') })).filter(page => page.text)
      : splitPdfByPage(text)

    return { text, pages }
  } catch (error) {
    console.error('PDF extraction gagal:', error)
    throw createError({ statusCode: 500, statusMessage: 'Gagal membaca PDF.' })
  } finally {
    await parser.destroy().catch(() => undefined)
  }
}
