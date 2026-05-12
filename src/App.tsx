import React, { useEffect, useMemo, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import demoData from '../database.json'
import EditorView from './editor/EditorView'

type Line = {
  nome: string
  fermate: string[]
  prezzi: number[][]
  codici: string[][]
}

type ValidationResult = {
  ok: boolean
  messages: string[]
}

type DraftData = {
  data: Line[]
  selectedLine: number
  status: string
}

const STORAGE_KEY = 'tpl-fvg-editor-json-draft'

function cloneData(source: Line[]): Line[] {
  return JSON.parse(JSON.stringify(source)) as Line[]
}

  return (
    <div className="app-shell">
      <div className="bg-shape bg-shape-a" />
      <div className="bg-shape bg-shape-b" />
      <div className="app-container">
        <Analytics />
        <EditorView
          appVersion={appVersion}
          data={data}
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

  function updatePrice(row: number, col: number, value: string) {
    const n = Number(value)
    if (Number.isNaN(n)) return
    withCurrentLine((line) => {
      const prezzi = line.prezzi.map((r) => [...r])
      prezzi[row][col] = n
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
      <>
        <Analytics />
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
      </>
    )
  }

  if (!current) {
    return (
      <>
        <Analytics />
        <div className="app-container">Nessuna linea disponibile.</div>
      </>
    )
  }

  return (
<<<<<<< HEAD
    <>
      <Analytics />
      <div className="app-shell">
        <div className="bg-shape bg-shape-a" />
        <div className="bg-shape bg-shape-b" />
        <div className="app-container">
        <header className="hero">
          <h1>TPL FVG Editor JSON</h1>
          <p>Editor guidato per fermate, prezzi e codici. Nessun tool tecnico richiesto.</p>
        </header>

        <section className="panel controls-grid">
          <button type="button" onClick={goBack}>↶ Indietro</button>
          <button type="button" onClick={downloadJSON} disabled={!data}>
            Scarica JSON
          </button>
          <button type="button" onClick={addLine}>Aggiungi linea</button>
          <button type="button" onClick={addStop} disabled={!current}>
            Aggiungi fermata
          </button>
          <button type="button" className="danger" onClick={removeLine} disabled={!data || data.length <= 1}>
            Cancella linea
          </button>
        </section>

        <section className="panel status-panel">
          <strong>Stato:</strong> {status}
          {error && <div className="error">{error}</div>}
          {!validation.ok && (
            <ul className="warning-list">
              {validation.messages.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <label>
            Linea
            <select value={selectedLine} onChange={(e) => setSelectedLine(Number(e.target.value))}>
              {data.map((line, idx) => (
                <option key={`${line.nome}-${idx}`} value={idx}>
                  {line.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nome linea
            <input
              value={current.nome}
              onChange={(e) => withCurrentLine((line) => ({ ...line, nome: e.target.value }))}
            />
          </label>
        </section>

        <section className="panel">
          <h2>Fermate</h2>
          <div className="stops-list">
            {current.fermate.map((stop, idx) => (
              <div key={`${stop}-${idx}`} className="stop-row">
                <span>{idx + 1}</span>
                <input value={stop} onChange={(e) => updateStopName(idx, e.target.value)} />
                <button type="button" className="danger" onClick={() => removeStop(idx)}>Rimuovi</button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Matrice prezzi</h2>
          <p className="matrix-note">Intestazioni compatte: passa il mouse sul numero per vedere la fermata completa.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Da/Per</th>
                  {current.fermate.map((f, col) => (
                    <th key={`${f}-${col}`} title={f}>{col + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.fermate.map((from, row) => (
                  <tr key={`${from}-${row}`}>
                    <th title={from}>{row + 1}</th>
                    {current.fermate.map((_, col) => (
                      <td key={`${row}-${col}`}>
                        <input
                          className="cell-input"
                          type="number"
                          step="0.5"
                          value={current.prezzi[row][col]}
                          onChange={(e) => updatePrice(row, col, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Matrice codici</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Da/Per</th>
                  {current.fermate.map((f, col) => (
                    <th key={`${f}-${col}`} title={f}>{col + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.fermate.map((from, row) => (
                  <tr key={`${from}-${row}`}>
                    <th title={from}>{row + 1}</th>
                    {current.fermate.map((_, col) => (
                      <td key={`${row}-${col}`}>
                        <input
                          className="cell-input"
                          value={current.codici[row][col]}
                          onChange={(e) => updateCode(row, col, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="legend-grid">
            {current.fermate.map((stop, idx) => (
              <div key={`${stop}-legend-${idx}`}>{idx + 1}. {stop}</div>
            ))}
          </div>
        </section>

        {confirmDialog?.show && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <h2>Conferma cancellazione</h2>
              <p>
                Sei sicuro di voler cancellare la linea <strong>{confirmDialog.lineName}</strong>?
              </p>
              <p className="dialog-warning">Questa azione non può essere annullata.</p>
              <div className="dialog-buttons">
                <button type="button" className="btn-cancel" onClick={cancelRemoveLine}>
                  Annulla
                </button>
                <button type="button" className="btn-danger" onClick={confirmRemoveLine}>
                  Cancella
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
=======
    <div className="app-shell">
      <div className="bg-shape bg-shape-a" />
      <div className="bg-shape bg-shape-b" />
      <div className="app-container">
        <EditorView
          appVersion={appVersion}
          data={data}
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
>>>>>>> 1784338 (0.7.0 - Versionamento e editor responsive modulare)
      </div>
    </>
  )
}
