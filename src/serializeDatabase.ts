import type { Line } from './editorTypes'

function normalizeCodeForExport(code: unknown): string {
  if (typeof code !== 'string') return ''
  let cleaned = code.trim().toUpperCase()
  cleaned = cleaned.replace(/\s+/g, '')
  // Only convert single-digit E1..E9 into E01..E09
  if (/^E[1-9]$/.test(cleaned)) {
    return `E0${cleaned.slice(1)}`
  }
  return cleaned
}

export function serializeDatabase(lines: Line[]): string {
  const out = lines.map((line) => {
    const size = line.fermate.length
    const codici: string[][] = []
    const prezzi: number[][] = []

    for (let r = 0; r < size; r += 1) {
      codici[r] = []
      prezzi[r] = []
      for (let c = 0; c < size; c += 1) {
        codici[r][c] = normalizeCodeForExport(line.codici?.[r]?.[c])
        prezzi[r][c] = Number.isFinite(line.prezzi?.[r]?.[c]) ? Number(line.prezzi[r][c]) : 0
      }
    }

    return {
      nome: line.nome,
      fermate: [...line.fermate],
      prezzi,
      codici
    }
  })

  return JSON.stringify(out, null, 2)
}
