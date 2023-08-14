import { type ISettingsParam, Logger } from 'tslog'

export const appLog = new Logger({ name: 'app', type: 'json', hideLogPositionForProduction: true })

export const createLoggerInstance = (name: string, opts?: Omit<ISettingsParam<unknown>, 'name'>) =>
	appLog.getSubLogger({ name, ...opts })
