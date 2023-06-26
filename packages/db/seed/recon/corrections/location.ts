import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

export const countryCorrection = superjson.parse<Map<string, string>>(
	fs.readFileSync(path.resolve(__dirname, `./country.json`), 'utf-8')
)

export const countryOverrideId = superjson.parse<Map<string, string>>(
	fs.readFileSync(path.resolve(__dirname, `./countryById.json`), 'utf-8')
)
export const govDistCorrection = superjson.parse<Map<string, string | undefined>>(
	fs.readFileSync(path.resolve(__dirname, `./govDist.json`), 'utf-8')
)
export const govDistFromCity = superjson.parse<Map<string, string>>(
	fs.readFileSync(path.resolve(__dirname, `./govDistCity.json`), 'utf-8')
)
