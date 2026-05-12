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
	updatePrice: (row: number, col: number, value: string) => void
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

function ActionBar({ actions, canDeleteLine }: { actions: EditorActions; canDeleteLine: boolean }) {
	return (
		<section className="panel controls-grid">
			<button type="button" onClick={actions.goBack}>↶ Indietro</button>
			<button type="button" onClick={actions.downloadJSON}>Scarica JSON</button>
			<button type="button" onClick={actions.addLine}>Aggiungi linea</button>
			<button type="button" onClick={actions.addStop}>Aggiungi fermata</button>
			<button type="button" className="danger" onClick={actions.removeLine} disabled={!canDeleteLine}>
				Cancella linea
			</button>
		</section>
	)
}

function LineSelector({
	data,
	selectedLine,
	setSelectedLine,
	withCurrentLine
}: {
	data: Line[]
	selectedLine: number
	setSelectedLine: EditorActions['setSelectedLine']
	withCurrentLine: EditorActions['withCurrentLine']
}) {
	return (
		<section className="panel">
			<label>
				Linea
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
		</section>
	)
}

function StopsList({
	current,
	removeStop,
	updateStopName
}: {
	current: Line
	removeStop: EditorActions['removeStop']
	updateStopName: EditorActions['updateStopName']
}) {
	return (
		<section className="panel">
			<h2>Fermate</h2>
			<div className="stops-list">
				{current.fermate.map((stop, idx) => (
					<div key={idx} className="stop-row">
						<span>{idx + 1}</span>
						<input value={stop} onChange={(e) => updateStopName(idx, e.target.value)} />
						<button type="button" className="danger" onClick={() => removeStop(idx)}>Rimuovi</button>
					</div>
				))}
			</div>
		</section>
	)
}

function MatrixSection({ title, current, kind, updatePrice, updateCode }: { title: string; current: Line; kind: 'price' | 'code'; updatePrice: EditorActions['updatePrice']; updateCode: EditorActions['updateCode'] }) {
	return (
		<section className="panel">
			<h2>{title}</h2>
			<p className="matrix-note">Intestazioni compatte: passa il mouse sul numero per vedere la fermata completa.</p>
			<div className="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Da/Per</th>
							{current.fermate.map((f, col) => (<th key={col} title={f}>{col + 1}</th>))}
						</tr>
					</thead>
					<tbody>
						{current.fermate.map((from, row) => (
							<tr key={row}>
								<th title={from}>{row + 1}</th>
								{current.fermate.map((_, col) => (
									<td key={`${row}-${col}`}>
										<input
											className="cell-input"
											type={kind === 'price' ? 'number' : 'text'}
											step={kind === 'price' ? '0.5' : undefined}
											value={kind === 'price' ? current.prezzi[row][col] : current.codici[row][col]}
											onChange={(e) => kind === 'price' ? updatePrice(row, col, e.target.value) : updateCode(row, col, e.target.value)}
										/>
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
	updateCode
}: {
	title: string
	current: Line
	kind: 'price' | 'code'
	updatePrice: EditorActions['updatePrice']
	updateCode: EditorActions['updateCode']
}) {
	return (
		<section className="panel">
			<h2>{title}</h2>
			<div className="matrix-card-grid">
				{current.fermate.map((from, row) => (
					<div key={row} className="matrix-card">
						<header>
							<strong>{row + 1}. {from}</strong>
						</header>
						<div className="matrix-card-cells">
							{current.fermate.map((to, col) => (
								<label key={`${row}-${col}`} className="matrix-cell-card">
									<span title={to}>{col + 1}</span>
									<input
										className="cell-input"
										type={kind === 'price' ? 'number' : 'text'}
										step={kind === 'price' ? '0.5' : undefined}
										value={kind === 'price' ? current.prezzi[row][col] : current.codici[row][col]}
										onChange={(e) => kind === 'price' ? updatePrice(row, col, e.target.value) : updateCode(row, col, e.target.value)}
									/>
								</label>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

function DesktopEditor(props: EditorViewProps) {
	const { data, current, selectedLine, actions, validation, status, error } = props
	return (
		<>
			<CommonHeader appVersion={props.appVersion} footerLabel={props.footerLabel} />
			<ActionBar actions={actions} canDeleteLine={data.length > 1} />
			<StatusPanel validation={validation} status={status} error={error} />
			<LineSelector data={data} selectedLine={selectedLine} setSelectedLine={actions.setSelectedLine} withCurrentLine={actions.withCurrentLine} />
			<StopsList current={current} removeStop={actions.removeStop} updateStopName={actions.updateStopName} />
			<MatrixSection title="Matrice prezzi" current={current} kind="price" updatePrice={actions.updatePrice} updateCode={actions.updateCode} />
			<MatrixSection title="Matrice codici" current={current} kind="code" updatePrice={actions.updatePrice} updateCode={actions.updateCode} />
			<ConfirmDialog confirmDialog={props.confirmDialog} cancelRemoveLine={actions.cancelRemoveLine} confirmRemoveLine={actions.confirmRemoveLine} />
			<FooterBar footerLabel={props.footerLabel} appVersion={props.appVersion} />
		</>
	)
}

function TabletEditor(props: EditorViewProps) {
	const { data, current, selectedLine, actions, validation, status, error } = props
	return (
		<>
			<CommonHeader appVersion={props.appVersion} footerLabel={props.footerLabel} />
			<ActionBar actions={actions} canDeleteLine={data.length > 1} />
			<StatusPanel validation={validation} status={status} error={error} />
			<section className="tablet-grid">
				<LineSelector data={data} selectedLine={selectedLine} setSelectedLine={actions.setSelectedLine} withCurrentLine={actions.withCurrentLine} />
				<StopsList current={current} removeStop={actions.removeStop} updateStopName={actions.updateStopName} />
			</section>
			<MatrixSection title="Matrice prezzi" current={current} kind="price" updatePrice={actions.updatePrice} updateCode={actions.updateCode} />
			<MatrixSection title="Matrice codici" current={current} kind="code" updatePrice={actions.updatePrice} updateCode={actions.updateCode} />
			<ConfirmDialog confirmDialog={props.confirmDialog} cancelRemoveLine={actions.cancelRemoveLine} confirmRemoveLine={actions.confirmRemoveLine} />
			<FooterBar footerLabel={props.footerLabel} appVersion={props.appVersion} />
		</>
	)
}

function MobileEditor(props: EditorViewProps) {
	const { data, current, selectedLine, actions, validation, status, error } = props
	return (
		<>
			<CommonHeader appVersion={props.appVersion} footerLabel={props.footerLabel} />
			<ActionBar actions={actions} canDeleteLine={data.length > 1} />
			<StatusPanel validation={validation} status={status} error={error} />
			<section className="mobile-stack">
				<LineSelector data={data} selectedLine={selectedLine} setSelectedLine={actions.setSelectedLine} withCurrentLine={actions.withCurrentLine} />
				<StopsList current={current} removeStop={actions.removeStop} updateStopName={actions.updateStopName} />
				<CompactMatrixSection title="Matrice prezzi" current={current} kind="price" updatePrice={actions.updatePrice} updateCode={actions.updateCode} />
				<CompactMatrixSection title="Matrice codici" current={current} kind="code" updatePrice={actions.updatePrice} updateCode={actions.updateCode} />
			</section>
			<ConfirmDialog confirmDialog={props.confirmDialog} cancelRemoveLine={actions.cancelRemoveLine} confirmRemoveLine={actions.confirmRemoveLine} />
			<FooterBar footerLabel={props.footerLabel} appVersion={props.appVersion} />
		</>
	)
}

export default function EditorView(props: EditorViewProps) {
	const mode = useResponsiveMode()
	if (mode === 'mobile') return <MobileEditor {...props} />
	if (mode === 'tablet') return <TabletEditor {...props} />
	return <DesktopEditor {...props} />
}
