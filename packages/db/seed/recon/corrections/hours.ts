import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

export const hoursCorrection = superjson.parse<Map<string, string | undefined>>(
	fs.readFileSync(path.resolve(__dirname, `./hours.json`), 'utf-8')
)

export const hoursMeta = ['multi', '24h', 'closed']
export const dayMap = new Map<string, number>([
	['sunday', 0],
	['monday', 1],
	['tuesday', 2],
	['wednesday', 3],
	['thursday', 4],
	['friday', 5],
	['saturday', 6],
])
