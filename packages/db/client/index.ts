/* eslint-disable node/no-process-env */
import { PrismaPg } from '@prisma/adapter-pg'
import { type Prisma, PrismaClient } from '@prisma/client'
import { isLocalDev, isVercelDev } from '@weareinreach/env'
import { createLoggerInstance } from '@weareinreach/util/logger'

import { idGeneratorExtension } from '~db/client/extensions/idGenerator'
import { jsonExtension } from '~db/client/extensions/json'

const log = createLoggerInstance('prisma')
const verboseLogging = Boolean(
	process.env.NODE_ENV === 'development' && (!!process.env.NEXT_VERBOSE || !!process.env.PRISMA_VERBOSE)
)

const getErrorFormat = (): Prisma.PrismaClientOptions['errorFormat'] => {
	if (isLocalDev) {
		return 'pretty'
	}
	if (isVercelDev) {
		return 'colorless'
	}
	return 'minimal'
}

declare global {
	// eslint-disable-next-line no-var -- allow global `var` declarations
	var prisma: PrismaClient<typeof clientOptions> | undefined
}

const clientOptions = {
	log: verboseLogging
		? [
				{ level: 'query', emit: 'event' },
				{ level: 'error', emit: 'stdout' },
				{ level: 'warn', emit: 'stdout' },
			]
		: [
				{ level: 'error', emit: 'event' },
				{ level: 'warn', emit: 'event' },
				// { level: 'info', emit: 'event' },
			],
	errorFormat: getErrorFormat(),
} satisfies Prisma.PrismaClientOptions

const generateClient = () => {
	// Driver adapters are mandatory as of Prisma 7 - the client no longer connects from a bare
	// connection string. Uses DATABASE_URL (not DB_DIRECT_URL) since this is the runtime
	// connection pool, same URL the client always used before this adapter was required.
	const adapter = new PrismaPg(process.env.DATABASE_URL as string)
	const client = new PrismaClient({ ...clientOptions, adapter })

	// if (verboseLogging) {
	// 	const queryLogger = createPrismaQueryEventHandler({
	// 		queryDuration: true,
	// 		format: true,
	// 		indent: '\t',
	// 		language: 'pl/sql',
	// 		logger: (data) => log.info(`\n${data}`),
	// 	})
	// 	client.$on('query', queryLogger)
	// }
	// else {
	client.$on('error', (event) => log.error(event))
	client.$on('warn', (event) => log.warn(event))
	// client.$on('info', (event) => log.info(event))
	// }

	return client.$extends(jsonExtension).$extends(idGeneratorExtension) as unknown as PrismaClient
}

const prisma = global.prisma ?? generateClient()

if (process.env.NODE_ENV !== 'production') {
	global.prisma ??= prisma
}
export { prisma }
export type * from '@prisma/client'
export { Prisma, $Enums as PrismaEnums } from '@prisma/client'
