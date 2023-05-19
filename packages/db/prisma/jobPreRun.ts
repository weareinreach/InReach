import { ListrTaskEventType } from 'listr2'
import { DateTime } from 'luxon'

import fs from 'fs'
import path from 'path'

import { type PassedTask } from './dataMigrationRunner'
import { prisma } from '..'

const getTimestamp = () => DateTime.now().toLocaleString(DateTime.TIME_24_WITH_SECONDS).replaceAll(':', '.')

const logFile = (file: string, output: string) => {
	const timestamp = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
	const outFile = path.resolve(__dirname, './migration-logs/', file)
	const formattedOutput = `[${timestamp}] ${output}\n`
	fs.writeFileSync(outFile, formattedOutput, { flag: 'a' })
}

export const createLogger = (task: PassedTask, jobId: string) => {
	const timestamp = getTimestamp()
	const logFilename = `${jobId}_${timestamp}.log`
	task.task.on(ListrTaskEventType.OUTPUT, (output) => logFile(logFilename, output))
}

export const jobPreRunner = async (jobDef: JobDef, task: PassedTask) => {
	try {
		const exists = await prisma.dataMigration.findUnique({
			where: { jobId: jobDef.jobId },
			select: { id: true },
		})
		if (exists?.id) {
			return true
		}
		createLogger(task, jobDef.jobId)
		return false
	} catch (err) {
		return true
	}
}

export const jobPostRunner = async (jobDef: JobDef) => {
	try {
		await prisma.dataMigration.create({ data: jobDef })
	} catch (err) {
		console.error(err)
		throw err
	}
}
export interface JobDef {
	jobId: string
	title: string
	description?: string
	createdBy: string
}
