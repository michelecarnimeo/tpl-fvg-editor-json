export type Line = {
	nome: string
	fermate: string[]
	prezzi: number[][]
	codici: string[][]
}

export type ValidationResult = {
	ok: boolean
	messages: string[]
}

export type DraftData = {
	data: Line[]
	selectedLine: number
	status: string
}
