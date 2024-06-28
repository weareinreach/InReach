/* eslint-disable node/no-process-env */
import { type Prisma, PrismaClient } from '@prisma/client'
import { createPrismaQueryEventHandler } from 'prisma-query-log'

import { createLoggerInstance } from '@weareinreach/util/logger'
import { idGeneratorExtension } from '~db/client/extensions/idGenerator'
import { jsonExtension } from '~db/client/extensions/json'

const log = createLoggerInstance('prisma')
const verboseLogging = Boolean(
	process.env.NODE_ENV === 'development' && (!!process.env.NEXT_VERBOSE || !!process.env.PRISMA_VERBOSE)
)

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
			],
	errorFormat: 'pretty',
} satisfies Prisma.PrismaClientOptions

const generateClient = () => {
	const client = new PrismaClient(clientOptions)

	if (verboseLogging) {
		const queryLogger = createPrismaQueryEventHandler({
			queryDuration: true,
			format: true,
			indent: '\t',
			language: 'pl/sql',
			logger: (data) => log.info(`\n${data}`),
		})
		client.$on('query', queryLogger)
	} else {
		client.$on('error', (event) => log.error(event))
		client.$on('warn', (event) => log.warn(event))
	}

	return client.$extends(jsonExtension).$extends(idGeneratorExtension) as unknown as PrismaClient<
		typeof clientOptions
	>
}

const prisma = global.prisma ?? generateClient()

if (process.env.NODE_ENV !== 'production') {
	global.prisma ??= prisma
}
export { prisma }
export type * from '@prisma/client'
export { Prisma, $Enums as PrismaEnums } from '@prisma/client'
