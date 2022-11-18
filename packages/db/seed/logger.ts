import { Console } from 'console'
import fs from 'fs'

export const logFile = new Console({
	stdout: fs.createWriteStream('./seed/seed.log'),
})
