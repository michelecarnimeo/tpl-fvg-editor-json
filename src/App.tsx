import React, { useEffect, useMemo, useState } from 'react'
import demoData from '../database.json'
import EditorView from './editor/EditorView'
import { serializeDatabase } from './serializeDatabase'
import type { DraftData, Line, ValidationResult } from './editorTypes'

const STORAGE_KEY = 'tpl-fvg-editor-json-draft'

function cloneData(source: Line[]): Line[] {
  return JSON.parse(JSON.stringify(source)) as Line[]
}

function normalizeLine(line: Line): Line {
  const size = line.fermate.length
  const normalizedPrezzi: number[][] = []
  const normalizedCodici: string[][] = []

  for (let r = 0; r < size; r += 1) {
    normalizedPrezzi[r] = []
    normalizedCodici[r] = []
    for (let c = 0; c < size; c += 1) {
      const price = line.prezzi?.[r]?.[c]
      const code = line.codici?.[r]?.[c]
      normalizedPrezzi[r][c] = Number.isFinite(price) ? Number(price) : 0
      normalizedCodici[r][c] = typeof code === 'string' ? code : ''
    }
  }

  return {
    nome: line.nome,
    fermate: [...line.fermate],
    prezzi: normalizedPrezzi,
    codici: normalizedCodici
  }
}

function validateData(lines: Line[]): ValidationResult {
  const messages: string[] = []
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, messages: ['Il file deve contenere almeno una linea.'] }
  }

  lines.forEach((line, lineIndex) => {
    if (!line.nome || typeof line.nome !== 'string') {
      messages.push(`Linea #${lineIndex + 1}: nome mancante o non valido.`)
    }
    if (!Array.isArray(line.fermate) || line.fermate.length === 0) {
      messages.push(`Linea #${lineIndex + 1}: fermate mancanti.`)
      return
    }

    const size = line.fermate.length
    if (!Array.isArray(line.prezzi) || line.prezzi.length !== size) {
      messages.push(`Linea #${lineIndex + 1}: matrice prezzi non quadrata.`)
    }
    if (!Array.isArray(line.codici) || line.codici.length !== size) {
      messages.push(`Linea #${lineIndex + 1}: matrice codici non quadrata.`)
    }
  })

  return { ok: messages.length === 0, messages }
}

export default function App() {
  const appVersion = '0.8.0'
  const [mode, setMode] = useState<'start' | 'editor'>('start')
  const [data, setData] = useState<Line[] | null>(null)
  const [selectedLine, setSelectedLine] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; lineIndex: number; lineName: string } | null>(null)
  const [hasDraft, setHasDraft] = useState(false)

  const current = data ? data[selectedLine] : undefined

  const validation = useMemo(() => {
    if (!data) return { ok: true, messages: [] }
    return validateData(data)
  }, [data])

  useEffect(() => {
    setHasDraft(window.localStorage.getItem(STORAGE_KEY) !== null)
  }, [])

  useEffect(() => {
    if (mode !== 'editor' || !data) return

    const draft: DraftData = {
      data,
      selectedLine,
      status
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setHasDraft(true)
  }, [data, mode, selectedLine, status])

  function restoreDraft() {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as DraftData
      const restored = parsed.data.map((line) => normalizeLine(line))
      setData(restored)
      setSelectedLine(Math.min(parsed.selectedLine ?? 0, Math.max(restored.length - 1, 0)))
      setStatus(parsed.status || 'Bozza ripristinata automaticamente.')
      setError(null)
      setMode('editor')
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
      setHasDraft(false)
      setError('La bozza salvata non è valida ed è stata rimossa.')
    }
  }

  function clearDraft() {
    window.localStorage.removeItem(STORAGE_KEY)
    setHasDraft(false)
  }

  function withCurrentLine(mutator: (line: Line) => Line) {
    setData((prev) => {
      if (!prev || !prev[selectedLine]) return prev
      const next = cloneData(prev)
      next[selectedLine] = mutator(next[selectedLine])
      return next
    })
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Line[]
        if (!Array.isArray(parsed)) {
          throw new Error('La radice JSON deve essere un array di linee.')
        }

        const normalized = parsed.map((line) => normalizeLine(line))
        setData(normalized)
        setSelectedLine(0)
        setStatus(`File caricato: ${file.name}`)
        setError(null)
        setMode('editor')
        setHasDraft(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Errore di lettura file JSON.'
        setError(`JSON non valido: ${message}`)
      }
    }
    reader.readAsText(file)
  }

  function createNew() {
    const newData: Line[] = [
      {
        nome: 'Nuova linea',
        fermate: ['Fermata 1', 'Fermata 2'],
        prezzi: [[0, 2.5], [2.5, 0]],
        codici: [['', 'E1'], ['E1', '']]
      }
    ]
    setData(newData)
    setSelectedLine(0)
    setStatus('Nuovo file creato. Inizia a modificare i dati.')
    setError(null)
    setMode('editor')
    setHasDraft(true)
  }

  function loadDemo() {
    const demoNormalized = cloneData(demoData as Line[]).map(normalizeLine)
    setData(demoNormalized)
    setSelectedLine(0)
    setError(null)
    setStatus('Modalita demo attivata. I dati sono di esempio.')
    setMode('editor')
    setHasDraft(true)
  }

  function goBack() {
    setMode('start')
    setStatus('')
    setError(null)
  }

  function downloadJSON() {
    if (!data) return
    const blob = new Blob([serializeDatabase(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'database.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Download completato: database.json')
  }

  function saveStatusBadge() {
    return data ? `${data.length} linee, ${current?.fermate.length ?? 0} fermate` : 'Nessun file aperto'
  }

  function addLine() {
    if (!data) {
      const firstLine: Line = {
        nome: 'Nuova linea 1',
        fermate: ['Nuova fermata'],
        prezzi: [[0]],
        codici: [['']]
      }
      setData([firstLine])
      setSelectedLine(0)
      setStatus('Creata prima linea vuota.')
      return
    }

    const newLine: Line = {
      nome: `Nuova linea ${data.length + 1}`,
      fermate: ['Nuova fermata'],
      prezzi: [[0]],
      codici: [['']]
    }
    setData((prev) => (prev ? [...prev, newLine] : [newLine]))
    setSelectedLine(data.length)
    setStatus('Nuova linea aggiunta.')
  }

  function removeLine() {
    if (!data || data.length <= 1) {
      setError('Non puoi cancellare l\'unica linea rimasta.')
      return
    }
    setConfirmDialog({
      show: true,
      lineIndex: selectedLine,
      lineName: data[selectedLine].nome
    })
  }

  function confirmRemoveLine() {
    if (!confirmDialog || !data) return
    const newData = data.filter((_, idx) => idx !== confirmDialog.lineIndex)
    setData(newData)
    const newIdx = confirmDialog.lineIndex >= newData.length ? newData.length - 1 : confirmDialog.lineIndex
    setSelectedLine(newIdx)
    setStatus('Linea cancellata.')
    setError(null)
    setConfirmDialog(null)
  }

  function cancelRemoveLine() {
    setConfirmDialog(null)
  }

  function addStop() {
    if (!current) return
    withCurrentLine((line) => {
      const size = line.fermate.length + 1
      const fermate = [...line.fermate, `Fermata ${size}`]
      const prezzi = [...line.prezzi.map((row) => [...row, 0]), new Array(size).fill(0)]
      const codici = [...line.codici.map((row) => [...row, '']), new Array(size).fill('')]
      return { ...line, fermate, prezzi, codici }
    })
    setStatus('Fermata aggiunta. Matrici aggiornate.')
  }

  function removeStop(index: number) {
    if (!current || current.fermate.length <= 1) return
    withCurrentLine((line) => {
      const fermate = line.fermate.filter((_, i) => i !== index)
      const prezzi = line.prezzi.filter((_, i) => i !== index).map((row) => row.filter((_, i) => i !== index))
      const codici = line.codici.filter((_, i) => i !== index).map((row) => row.filter((_, i) => i !== index))
      return { ...line, fermate, prezzi, codici }
    })
    setStatus('Fermata rimossa. Matrici aggiornate.')
  }

  function updateStopName(index: number, value: string) {
    withCurrentLine((line) => {
      const fermate = [...line.fermate]
      fermate[index] = value
      return { ...line, fermate }
    })
  }

  function updatePrice(row: number, col: number, value: number) {
    if (!Number.isFinite(value)) return
    withCurrentLine((line) => {
      const prezzi = line.prezzi.map((r) => [...r])
      prezzi[row][col] = value
      return { ...line, prezzi }
    })
  }

  function updateCode(row: number, col: number, value: string) {
    withCurrentLine((line) => {
      const codici = line.codici.map((r) => [...r])
      codici[row][col] = value.toUpperCase()
      return { ...line, codici }
    })
  }

  if (mode === 'start') {
    return (
      <div className="app-shell">
        <div className="bg-shape bg-shape-a" />
        <div className="bg-shape bg-shape-b" />
        <div className="app-container">
            <header className="hero">
              <h1>TPL FVG Editor JSON</h1>
              <p>Carica un file JSON da modificare oppure crea uno nuovo da zero.</p>
              <div className="hero-badges">
                <span>Desktop only</span>
                <span>Salvataggio locale</span>
                <span>Versione {appVersion}</span>
              </div>
            </header>

            {error && <section className="panel error">{error}</section>}

            {hasDraft && (
              <section className="panel draft-banner">
                <div>
                  <strong>Bozza trovata</strong>
                  <p>Puoi riprendere l'ultimo lavoro salvato in automatico.</p>
                </div>
                <div className="draft-actions">
                  <button type="button" onClick={restoreDraft}>Riprendi bozza</button>
                  <button type="button" className="danger" onClick={clearDraft}>Elimina bozza</button>
                </div>
              </section>
            )}

            <section className="panel start-screen">
              <div className="start-option">
                <h2>Carica un file JSON</h2>
                <p>Seleziona un database.json dal tuo computer per modificarlo.</p>
                <label className="file-input-large">
                  Scegli file...
                  <input type="file" accept="application/json" onChange={handleFile} />
                </label>
              </div>

              <div className="divider">o</div>

              <div className="start-option">
                <h2>Crea un nuovo file</h2>
                <p>Inizia da zero con una struttura base di esempio.</p>
                <button type="button" onClick={createNew} className="btn-large">
                  Crea nuovo file
                </button>
              </div>

              <div className="divider">oppure</div>

              <div className="start-option">
                <h2>Visualizza una demo</h2>
                <p>Guarda un esempio di file JSON come riferimento.</p>
                <button type="button" onClick={loadDemo} className="btn-large">
                  Modalita demo
                </button>
              </div>
            </section>
        </div>
      </div>
    )
  }

  if (!current) {
    return <div className="app-container">Nessuna linea disponibile.</div>
  }

  return (
    <div className="app-shell">
      <div className="bg-shape bg-shape-a" />
      <div className="bg-shape bg-shape-b" />
      <div className="app-container">
        <EditorView
          appVersion={appVersion}
          data={data ?? []}
          current={current}
          selectedLine={selectedLine}
          status={status}
          error={error}
          validation={validation}
          confirmDialog={confirmDialog}
          footerLabel={saveStatusBadge()}
          actions={{
            goBack,
            downloadJSON,
            addLine,
            removeLine,
            addStop,
            removeStop,
            updateStopName,
            updatePrice,
            updateCode,
            setSelectedLine,
            withCurrentLine,
            confirmRemoveLine,
            cancelRemoveLine
          }}
        />
      </div>
    </div>
  )
}
