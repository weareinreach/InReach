import { TRPCError } from '@trpc/server'
import { Prisma } from '@weareinreach/db'
import { Logger } from 'tslog'
import { ZodError } from 'zod'

import { PRISMA_ERROR_CODES } from './prismaErrorCodes'

const mapEntries = Object.entries(PRISMA_ERROR_CODES).map(([key, value]) => [key, value]) satisfies [
	string,
	TRPCError['code']
][]
const prismaErrorMap = new Map<string, TRPCError['code']>(mapEntries)

const devLog = (error: unknown) => {
	// eslint-disable-next-line node/no-process-env
	if (process.env.NODE_ENV !== 'production') {
		const logger = new Logger()

		logger.error(error)
	}
}

export const handleError = (error: unknown) => {
	// devLog(error)
	// pass through if already TRPCError
	if (error instanceof TRPCError) {
		throw error
	}

	// Prisma db errors
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		const { message, cause } = error
		const code = prismaErrorMap.get(error.code) ?? 'INTERNAL_SERVER_ERROR'
		throw new TRPCError({ code, message, cause })
	}

	// Zod parsing errors
	if (error instanceof ZodError) {
		throw new TRPCError({ code: 'PARSE_ERROR', message: error.message, cause: error.flatten() })
	}

	// catch everything else
	if (error instanceof Error) {
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message, cause: error.cause })
	} else {
		if (typeof error === 'object') error = JSON.stringify(error)
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `${error}` })
	}
}
