import { TRPCError } from '@trpc/server'
import { ZodError } from 'zod'

import { Prisma } from '@weareinreach/db' // Ensure Prisma is correctly imported
import { createLoggerInstance } from '@weareinreach/util/logger'

import { PRISMA_ERROR_CODES } from './prismaErrorCodes'

const mapEntries = Object.entries(PRISMA_ERROR_CODES).map(([key, value]) => [key, value]) satisfies [
	string,
	TRPCError['code'],
][]
const prismaErrorMap = new Map<string, TRPCError['code']>(mapEntries)

const logger = createLoggerInstance('tRPC Error Handler')

export const handleError = (error: unknown) => {
	logger.error(error)

	// pass through if already TRPCError
	if (error instanceof TRPCError) {
		throw error
	}

	// Prisma db errors
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		// Introduce a new constant here after narrowing the type
		const prismaKnownError = error

		// Now destructure from the correctly narrowed variable
		const { message, cause } = prismaKnownError

		// Also use the new variable for accessing 'code'
		const code = prismaErrorMap.get(prismaKnownError.code) ?? 'INTERNAL_SERVER_ERROR'
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
		// Consider if you really want to stringify non-Error objects that might be complex
		// Or if you want a more specific catch for custom error types
		if (typeof error === 'object' && error !== null) {
			// Added null check for safety
			error = JSON.stringify(error)
		} else if (typeof error !== 'string') {
			// Ensure it's convertible to string
			error = String(error)
		}
		throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `${error}` })
	}
}
