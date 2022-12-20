import { Console } from 'console'
import fs from 'fs'
import { DateTime } from 'luxon'

const date = DateTime.now()

const dateFormat = date.toFormat('yyyy-MM-dd-HH.mm.ss')

export const logFile = new Console({
	stdout: fs.createWriteStream(`./seed/logs/seed-${dateFormat}.log`),
})
