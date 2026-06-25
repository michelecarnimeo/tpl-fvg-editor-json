import type { Line } from './editorTypes'

function formatPrice(value: number): string {
	if (value === 0) return '0'
	return value.toFixed(2)
}

function serializeFermate(fermate: string[]): string {
	return fermate.map((f) => `      ${JSON.stringify(f)}`).join(',\n')
}

function serializePrezzi(prezzi: number[][]): string {
	return prezzi.map((row) => `  [${row.map(formatPrice).join(', ')}]`).join(',\n')
}

function serializeCodici(codici: string[][]): string {
	return codici.map((row) => `      [${row.map((c) => JSON.stringify(c)).join(', ')}]`).join(',\n')
}

function serializeLine(line: Line): string {
	return `  {
    "nome": ${JSON.stringify(line.nome)},
    "fermate": [
${serializeFermate(line.fermate)}
    ],
    "prezzi": [
${serializePrezzi(line.prezzi)}
],
    "codici": [
${serializeCodici(line.codici)}
    ]
  }`
}

export function serializeDatabase(lines: Line[]): string {
	return `[\n${lines.map(serializeLine).join(',\n')}\n]`
}
