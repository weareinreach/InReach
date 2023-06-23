import { ListrTaskEventType } from 'listr2'
import { DateTime } from 'luxon'

import fs from 'fs'
import path from 'path'

import { type PassedTask } from './types'

const getTimestamp = () => DateTime.now().toFormat('yyyyMMdd_HHmmss')

const logFile = (file: string, output: string) => {
	const timestamp = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
	const outFile = path.resolve(__dirname, '../logs/', file)
	const formattedOutput = `[${timestamp}] ${output}\n`
	fs.writeFileSync(outFile, formattedOutput, { flag: 'a' })
}

const timestamp = getTimestamp()
const logFilename = `${timestamp}.log`
export const attachLogger = (task: PassedTask) =>
	task.task.on(ListrTaskEventType.OUTPUT, (output) => logFile(logFilename, output))
