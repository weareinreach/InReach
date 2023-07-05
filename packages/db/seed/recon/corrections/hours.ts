import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

export const hoursCorrection = superjson.parse<Map<string, string | undefined>>(
	fs.readFileSync(path.resolve(__dirname, `./hours.json`), 'utf-8')
)

export const hoursMeta = ['multi', '24h', 'closed']
export const dayMap = new Map<string, 0 | 1 | 2 | 3 | 4 | 5 | 6>([
	['sunday', 0],
	['monday', 1],
	['tuesday', 2],
	['wednesday', 3],
	['thursday', 4],
	['friday', 5],
	['saturday', 6],
])

export const timezoneMap = new Map([
	['PST', 'America/Los_Angeles'],
	['MST', 'America/Denver'],
	['CST', 'America/Chicago'],
	['EST', 'America/New_York'],
	['PDT', 'America/Los_Angeles'],
	['EDT', 'America/New_York'],
	['MDT', 'America/Denver'],
	['AST', 'America/Anchorage'],
	['NST', 'America/St_Johns'],
	['CDT', 'America/Chicago'],
	['HST', 'Pacific/Honolulu'],
	['AKST', 'America/Anchorage'],
])
