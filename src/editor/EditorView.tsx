import React, { useEffect, useState } from 'react'
import type { Line, ValidationResult } from '../editorTypes'

type EditorViewMode = 'desktop' | 'tablet' | 'mobile'

type EditorActions = {
    goBack: () => void
    downloadJSON: () => void
    addLine: () => void
    removeLine: () => void
    addStop: () => void
    removeStop: (index: number) => void
    updateStopName: (index: number, value: string) => void
    updatePrice: (row: number, col: number, value: number) => void
    updateCode: (row: number, col: number, value: string) => void
    setSelectedLine: (value: number) => void
    withCurrentLine: (mutator: (line: Line) => Line) => void
    confirmRemoveLine: () => void
    cancelRemoveLine: () => void
}

type EditorViewProps = {
    appVersion: string
    data: Line[]
    current: Line
    selectedLine: number
    status: string
    error: string | null
    validation: ValidationResult
    confirmDialog: { show: boolean; lineIndex: number; lineName: string } | null
    actions: EditorActions
    footerLabel: string
}

function useResponsiveMode() {
    const getMode = () => {
        if (window.innerWidth < 900) return 'mobile'
        if (window.innerWidth < 1280) return 'tablet'
        return 'desktop'
    }

    const [mode, setMode] = useState<EditorViewMode>(getMode)

    useEffect(() => {
        const handleResize = () => setMode(getMode())
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return mode
}

function CommonHeader({ appVersion, footerLabel }: { appVersion: string; footerLabel: string }) {
    return (
        <header className="hero">
            <h1>TPL FVG Editor JSON</h1>
            <p>Editor guidato per fermate, prezzi e codici. Nessun tool tecnico richiesto.</p>
            <div className="hero-badges">
                <span>{footerLabel}</span>
                <span>Autosave attivo</span>
                <span>Versione {appVersion}</span>
            </div>
        </header>
    )
}

function FooterBar({ footerLabel, appVersion }: { footerLabel: string; appVersion: string }) {
    return (
        <footer className="app-footer">
            <span>TPL FVG Editor JSON</span>
            <span>{footerLabel}</span>
            <span>Versione {appVersion}</span>
        </footer>
    )
}

function ConfirmDialog({ confirmDialog, cancelRemoveLine, confirmRemoveLine }: Pick<EditorViewProps, 'confirmDialog'> & Pick<EditorActions, 'cancelRemoveLine' | 'confirmRemoveLine'>) {
    if (!confirmDialog?.show) return null

    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <h2>Conferma cancellazione</h2>
                <p>
                    Sei sicuro di voler cancellare la linea <strong>{confirmDialog.lineName}</strong>?
                </p>
                <p className="dialog-warning">Questa azione non può essere annullata.</p>
                <div className="dialog-buttons">
                    <button type="button" className="btn-cancel" onClick={cancelRemoveLine}>Annulla</button>
                    <button type="button" className="btn-danger" onClick={confirmRemoveLine}>Cancella</button>
                </div>
            </div>
        </div>
    )
}

function StatusPanel({ status, error, validation }: Pick<EditorViewProps, 'status' | 'error' | 'validation'>) {
    return (
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
    )
}

function ActionBar({ actions, editMode, setEditMode, hasData }: { actions: EditorActions; editMode: string; setEditMode: (m: string) => void; hasData: boolean }) {
    return (
        <section className="panel controls-grid">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" onClick={actions.goBack}>↶ Indietro</button>
                <button type="button" onClick={actions.downloadJSON}>Scarica JSON</button>
            </div>
            {hasData && (
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    Modifica:
                    <select value={editMode} onChange={(e) => setEditMode(e.target.value)}>
                        <option value="all">Tutto</option>
                        <option value="stops">Solo fermate</option>
                        <option value="prices">Solo prezzi</option>
                        <option value="codes">Solo codici</option>
                    </select>
                </label>
            )}
        </section>
    )
}

function LineSelector({
    data,
    selectedLine,
    canDeleteLine,
    setSelectedLine,
    withCurrentLine,
    addLine,
    removeLine
}: {
    data: Line[]
    selectedLine: number
    canDeleteLine: boolean
    setSelectedLine: EditorActions['setSelectedLine']
    withCurrentLine: EditorActions['withCurrentLine']
    addLine: EditorActions['addLine']
    removeLine: EditorActions['removeLine']
}) {
    return (
        <section className="panel">
            <h2>Linea</h2>
            <label>
                Seleziona
                <select value={selectedLine} onChange={(e) => setSelectedLine(Number(e.target.value))}>
                    {data.map((line, idx) => (
                        <option key={`${line.nome}-${idx}`} value={idx}>{line.nome}</option>
                    ))}
                </select>
            </label>
            <label>
                Nome linea
                <input value={data[selectedLine].nome} onChange={(e) => withCurrentLine((line) => ({ ...line, nome: e.target.value }))} />
            </label>
            <div className="line-actions">
                <button type="button" onClick={addLine}>Aggiungi linea</button>
                <button type="button" className="danger" onClick={removeLine} disabled={!canDeleteLine}>
                    Cancella linea
                </button>
            </div>
        </section>
    )
}

function StopsList({
    current,
    addStop,
    removeStop,
    updateStopName,
    canEditStops
}: {
    current: Line
    addStop: EditorActions['addStop']
    removeStop: EditorActions['removeStop']
    updateStopName: EditorActions['updateStopName']
    canEditStops: boolean
}) {
    return (
        <section className="panel">
            <h2>Fermate</h2>
            <div className="stops-list">
                {current.fermate.map((stop, idx) => (
                    <div key={idx} className="stop-row">
                        <span>{idx + 1}</span>
                        <input value={stop} onChange={(e) => canEditStops && updateStopName(idx, e.target.value)} disabled={!canEditStops} />
                        <button type="button" className="danger" onClick={() => removeStop(idx)}>Rimuovi</button>
                    </div>
                ))}
            </div>
            <button type="button" className="stops-add" onClick={addStop}>Aggiungi fermata</button>
        </section>
    )
}

function parsePriceInput(raw: string): number | null {
    const trimmed = raw.trim().replace(',', '.')
    if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed.endsWith('.')) {
        return null
    }
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
}

function formatPriceDraft(value: number): string {
    return String(value)
}

function PriceCell({ value, onChange, editable = true }: { value: number; onChange: (value: number) => void; editable?: boolean }) {
    const [draft, setDraft] = useState(() => formatPriceDraft(value))
    const [focused, setFocused] = useState(false)

    useEffect(() => {
        if (!focused) setDraft(formatPriceDraft(value))
    }, [value, focused])

    function handleChange(next: string) {
        setDraft(next)
        const parsed = parsePriceInput(next)
        if (parsed !== null) onChange(parsed)
    }

    function handleBlur() {
        setFocused(false)
        const parsed = parsePriceInput(draft)
        if (parsed === null) {
            if (draft.trim() === '') {
                onChange(0)
                setDraft('0')
            } else {
                setDraft(formatPriceDraft(value))
            }
            return
        }
        onChange(parsed)
        setDraft(formatPriceDraft(parsed))
    }

    return (
        <input
            className="cell-input"
            type="text"
            inputMode="decimal"
            value={draft}
            disabled={!editable}
            onFocus={() => setFocused(true)}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
        />
    )
}


function MatrixSection({ title, current, kind, updatePrice, updateCode, editMode }: { title: string; current: Line; kind: 'price' | 'code'; updatePrice: EditorActions['updatePrice']; updateCode: EditorActions['updateCode']; editMode: string }) {
    const [hovered, setHovered] = useState<{ row: number | null; col: number | null }>({ row: null, col: null })
    const [hoverEnabled, setHoverEnabled] = useState(true)
    const canEditPrices = editMode === 'all' || editMode === 'prices'
    const canEditCodes = editMode === 'all' || editMode === 'codes'

    return (
        <section className="panel">
            <h2>{title}</h2>
            <p className="matrix-note">Intestazioni compatte: passa il mouse sul numero per vedere la fermata completa.</p>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>
                <input type="checkbox" checked={hoverEnabled} onChange={(e) => setHoverEnabled(e.target.checked)} style={{ marginRight: '0.5rem' }} />
                Evidenzia riga/colonna al passaggio del mouse
            </label>
            <div className={`table-wrap matrix-table ${hoverEnabled ? 'hover-enabled' : ''}`} onMouseLeave={() => setHovered({ row: null, col: null })}>
                <table>
                    <thead>
                        <tr>
                            <th>Da/Per</th>
                            {current.fermate.map((f, col) => (
                                <th key={col} title={f} className={hovered.col === col ? 'highlight-col' : ''}>{col + 1}. {f}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {current.fermate.map((from, row) => (
                            <tr key={row}>
                                <th title={from} className={hovered.row === row ? 'highlight-row' : ''}>{row + 1}. {from}</th>
                                {current.fermate.map((_, col) => (
                                    <td
                                        key={`${row}-${col}`}
                                        onMouseEnter={() => hoverEnabled && setHovered({ row, col })}
                                        className={`${hovered.row === row ? 'highlight-row' : ''} ${hovered.col === col ? 'highlight-col' : ''}`.trim()}
                                    >
                                        {kind === 'price' ? (
                                            <PriceCell
                                                value={current.prezzi[row][col]}
                                                onChange={(next) => canEditPrices && updatePrice(row, col, next)}
                                                editable={canEditPrices}
                                            />
                                        ) : (
                                            <input
                                                className="cell-input"
                                                type="text"
                                                value={current.codici[row][col]}
                                                onChange={(e) => canEditCodes && updateCode(row, col, e.target.value)}
                                                disabled={!canEditCodes}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

function CompactMatrixSection({
    title,
    current,
    kind,
    updatePrice,
    updateCode,
    editMode
}: {
    title: string
    current: Line
    kind: 'price' | 'code'
    updatePrice: EditorActions['updatePrice']
    updateCode: EditorActions['updateCode']
    editMode: string
}) {
    const [hovered, setHovered] = useState<{ row: number | null; col: number | null }>({ row: null, col: null })
    const [hoverEnabled, setHoverEnabled] = useState(true)
    const canEditPrices = editMode === 'all' || editMode === 'prices'
    const canEditCodes = editMode === 'all' || editMode === 'codes'

    return (
        <section className="panel">
            <h2>{title}</h2>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>
                <input type="checkbox" checked={hoverEnabled} onChange={(e) => setHoverEnabled(e.target.checked)} style={{ marginRight: '0.5rem' }} />
                Evidenzia riga/colonna al passaggio del mouse
            </label>
            <div className="matrix-card-grid compact-matrix">
                {current.fermate.map((from, row) => (
                    <div key={row} className={`matrix-card ${hovered.row === row ? 'highlight-row' : ''}`} onMouseLeave={() => hoverEnabled && setHovered({ row: null, col: null })}>
                        <header>
                            <strong>{row + 1}. {from}</strong>
                        </header>
                        <div className="matrix-card-cells">
                            {current.fermate.map((to, col) => (
                                <label
                                    key={`${row}-${col}`}
                                    className={`matrix-cell-card ${hovered.col === col ? 'highlight-col' : ''}`}
                                    onMouseEnter={() => hoverEnabled && setHovered({ row, col })}
                                >
                                    <span title={to}>{col + 1}</span>
                                    {kind === 'price' ? (
                                        <PriceCell
                                            value={current.prezzi[row][col]}
                                            onChange={(next) => canEditPrices && updatePrice(row, col, next)}
                                            editable={canEditPrices}
                                        />
                                    ) : (
                                        <input
                                            className="cell-input"
                                            type="text"
                                            value={current.codici[row][col]}
                                            onChange={(e) => canEditCodes && updateCode(row, col, e.target.value)}
                                            disabled={!canEditCodes}
                                        />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

function DesktopEditor(props: EditorViewProps & { editMode: string; setEditMode: (m: string) => void }) {
    const { data, current, selectedLine, actions, validation, status, error, editMode, setEditMode } = props
    const canEditStops = editMode === 'all' || editMode === 'stops'
    return (
        <>
            <CommonHeader appVersion={props.appVersion} footerLabel={props.footerLabel} />
            <ActionBar actions={actions} editMode={editMode} setEditMode={setEditMode} hasData={data.length > 0} />
            <StatusPanel validation={validation} status={status} error={error} />
            {editMode === 'all' || editMode === 'stops' ? (
                <>
                    <LineSelector
                        data={data}
                        selectedLine={selectedLine}
                        canDeleteLine={data.length > 1}
                        setSelectedLine={actions.setSelectedLine}
                        withCurrentLine={actions.withCurrentLine}
                        addLine={actions.addLine}
                        removeLine={actions.removeLine}
                    />
                    <StopsList current={current} addStop={actions.addStop} removeStop={actions.removeStop} updateStopName={actions.updateStopName} canEditStops={canEditStops} />
                </>
            ) : null}

            {editMode === 'all' || editMode === 'prices' ? (
                <MatrixSection title="Matrice prezzi" current={current} kind="price" updatePrice={actions.updatePrice} updateCode={actions.updateCode} editMode={editMode} />
            ) : null}

            {editMode === 'all' || editMode === 'codes' ? (
                <MatrixSection title="Matrice codici" current={current} kind="code" updatePrice={actions.updatePrice} updateCode={actions.updateCode} editMode={editMode} />
            ) : null}
            <ConfirmDialog confirmDialog={props.confirmDialog} cancelRemoveLine={actions.cancelRemoveLine} confirmRemoveLine={actions.confirmRemoveLine} />
            <FooterBar footerLabel={props.footerLabel} appVersion={props.appVersion} />
        </>
    )
}

function TabletEditor(props: EditorViewProps & { editMode: string; setEditMode: (m: string) => void }) {
    const { data, current, selectedLine, actions, validation, status, error, editMode, setEditMode } = props
    const canEditStops = editMode === 'all' || editMode === 'stops'
    return (
        <>
            <CommonHeader appVersion={props.appVersion} footerLabel={props.footerLabel} />
            <ActionBar actions={actions} editMode={editMode} setEditMode={setEditMode} hasData={data.length > 0} />
            <StatusPanel validation={validation} status={status} error={error} />
            <section className="tablet-grid">
                {editMode === 'all' || editMode === 'stops' ? (
                    <>
                        <LineSelector
                            data={data}
                            selectedLine={selectedLine}
                            canDeleteLine={data.length > 1}
                            setSelectedLine={actions.setSelectedLine}
                            withCurrentLine={actions.withCurrentLine}
                            addLine={actions.addLine}
                            removeLine={actions.removeLine}
                        />
                        <StopsList current={current} addStop={actions.addStop} removeStop={actions.removeStop} updateStopName={actions.updateStopName} canEditStops={canEditStops} />
                    </>
                ) : null}
            </section>
            {editMode === 'all' || editMode === 'prices' ? (
                <MatrixSection title="Matrice prezzi" current={current} kind="price" updatePrice={actions.updatePrice} updateCode={actions.updateCode} editMode={editMode} />
            ) : null}
            {editMode === 'all' || editMode === 'codes' ? (
                <MatrixSection title="Matrice codici" current={current} kind="code" updatePrice={actions.updatePrice} updateCode={actions.updateCode} editMode={editMode} />
            ) : null}
            <ConfirmDialog confirmDialog={props.confirmDialog} cancelRemoveLine={actions.cancelRemoveLine} confirmRemoveLine={actions.confirmRemoveLine} />
            <FooterBar footerLabel={props.footerLabel} appVersion={props.appVersion} />
        </>
    )
}

function MobileEditor(props: EditorViewProps & { editMode: string; setEditMode: (m: string) => void }) {
    const { data, current, selectedLine, actions, validation, status, error, editMode, setEditMode } = props
    const canEditStops = editMode === 'all' || editMode === 'stops'
    return (
        <>
            <CommonHeader appVersion={props.appVersion} footerLabel={props.footerLabel} />
            <ActionBar actions={actions} editMode={editMode} setEditMode={setEditMode} hasData={data.length > 0} />
            <StatusPanel validation={validation} status={status} error={error} />
            <section className="mobile-stack">
                {editMode === 'all' || editMode === 'stops' ? (
                    <>
                        <LineSelector
                            data={data}
                            selectedLine={selectedLine}
                            canDeleteLine={data.length > 1}
                            setSelectedLine={actions.setSelectedLine}
                            withCurrentLine={actions.withCurrentLine}
                            addLine={actions.addLine}
                            removeLine={actions.removeLine}
                        />
                        <StopsList current={current} addStop={actions.addStop} removeStop={actions.removeStop} updateStopName={actions.updateStopName} canEditStops={canEditStops} />
                    </>
                ) : null}
                {editMode === 'all' || editMode === 'prices' ? (
                    <CompactMatrixSection title="Matrice prezzi" current={current} kind="price" updatePrice={actions.updatePrice} updateCode={actions.updateCode} editMode={editMode} />
                ) : null}
                {editMode === 'all' || editMode === 'codes' ? (
                    <CompactMatrixSection title="Matrice codici" current={current} kind="code" updatePrice={actions.updatePrice} updateCode={actions.updateCode} editMode={editMode} />
                ) : null}
            </section>
            <ConfirmDialog confirmDialog={props.confirmDialog} cancelRemoveLine={actions.cancelRemoveLine} confirmRemoveLine={actions.confirmRemoveLine} />
            <FooterBar footerLabel={props.footerLabel} appVersion={props.appVersion} />
        </>
    )
}

export default function EditorView(props: EditorViewProps & { editMode: 'all' | 'stops' | 'prices' | 'codes'; setEditMode: (m: 'all' | 'stops' | 'prices' | 'codes') => void }) {
    const mode = useResponsiveMode()
    if (mode === 'mobile') return <MobileEditor {...props} editMode={props.editMode} setEditMode={props.setEditMode} />
    if (mode === 'tablet') return <TabletEditor {...props} editMode={props.editMode} setEditMode={props.setEditMode} />
    return <DesktopEditor {...props} editMode={props.editMode} setEditMode={props.setEditMode} />
}
