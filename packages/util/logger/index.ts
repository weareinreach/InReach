import { type ISettingsParam, Logger } from 'tslog'

// eslint-disable-next-line node/no-process-env
const isDev = process.env.NODE_ENV === 'development'

export const appLog = new Logger({
	name: 'app',
	type: isDev ? 'pretty' : 'json',
	hideLogPositionForProduction: true,
})

export const createLoggerInstance = (name: string, opts?: Omit<ISettingsParam<unknown>, 'name'>) =>
	appLog.getSubLogger({ name, ...opts })
