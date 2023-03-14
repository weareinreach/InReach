import fs from 'fs'
import path from 'path'

const dir = path.resolve(__dirname, '_generated')
const filePath = `${dir}/idMap.json`

type IdEntry = [string, string]

const isIdMap = (data: unknown): data is IdEntry[] => {
	if (Array.isArray(data)) {
		return data.every((entry) => entry.length === 2)
	}
	return false
}

const readMap = () => {
	const fileExists = fs.existsSync(filePath)
	if (fileExists) {
		const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
		if (isIdMap(data)) return data
	}
	return undefined
}
export const idMap = new Map<string, string>(readMap())

export const writeIdMap = () => {
	const writeData = Array.from(idMap.entries())
	fs.writeFileSync(filePath, JSON.stringify(writeData))
}
