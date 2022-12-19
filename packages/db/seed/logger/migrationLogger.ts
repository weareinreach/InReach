import { Console } from 'console'
import fs from 'fs'
import { DateTime } from 'luxon'

const date = DateTime.now()

const dateFormat = date.toFormat('yyyy-MM-dd-HH.mm.ss')

export const migrateLog = new Console({
	stdout: fs.createWriteStream(`./seed/logs/migrate-${dateFormat}.log`, { flags: 'w' }),
	stderr: fs.createWriteStream(`./seed/logs/migrate-${dateFormat}-error.log`, { flags: 'w' }),
})
