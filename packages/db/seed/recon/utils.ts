import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

export const readSuperJSON = <T = unknown>(filename: string) => {
	const data = fs.readFileSync(path.resolve(__dirname, `./generated/${filename}.json`), 'utf-8')
	return superjson.parse<T>(data)
}
