// import { get } from '@vercel/edge-config'
import { type ISettingsParam, Logger } from 'tslog'
// eslint-disable-next-line node/no-process-env
const isDev = process.env.NODE_ENV === 'development'

export const appLog = new Logger({
	name: 'app',
	type: isDev ? 'pretty' : 'json',
	// minLevel: isDev ? 0 : get<number>('minLogLevel').then((level) => level),
	prettyInspectOptions: {
		depth: 3,
		colors: true,
	},
	stylePrettyLogs: true,
	prettyErrorLoggerNameDelimiter: '',
	prettyLogTimeZone: isDev ? 'local' : 'UTC',
})

export const createLoggerInstance = (name: string, opts?: Omit<ISettingsParam<unknown>, 'name'>) =>
	appLog.getSubLogger({ name, ...opts })
