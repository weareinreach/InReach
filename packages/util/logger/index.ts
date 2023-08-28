/* eslint-disable node/no-process-env */
import { type ISettingsParam, Logger } from 'tslog'

const isDev = process.env.NODE_ENV === 'development'
const verboseLogging = Boolean(isDev && (!!process.env.NEXT_VERBOSE || !!process.env.PRISMA_VERBOSE))
export const appLog = new Logger({
	name: 'app',
	type: isDev ? 'pretty' : 'json',
	prettyInspectOptions: {
		depth: 3,
		colors: true,
	},
	stylePrettyLogs: true,
	prettyErrorLoggerNameDelimiter: '',
	prettyLogTimeZone: isDev ? 'local' : 'UTC',
	minLevel: verboseLogging ? 0 : 3,
})

export const createLoggerInstance = (name: string, opts?: Omit<ISettingsParam<unknown>, 'name'>) =>
	appLog.getSubLogger({ name, ...opts })
