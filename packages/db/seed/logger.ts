import { Console } from 'console'
import fs from 'fs'

const pad = (num) => String(num).padStart(2, '0')

const date = new Date(Date.now())
const yyyy = date.getFullYear()
const mm = pad(date.getMonth())
const dd = pad(date.getDay())
const h = pad(date.getHours())
const m = pad(date.getMinutes())
const s = pad(date.getSeconds())

const dateFormat = `${yyyy}-${mm}-${dd}-${h}.${m}.${s}`

export const logFile = new Console({
	stdout: fs.createWriteStream(`./seed/logs/${dateFormat}.log`),
})
