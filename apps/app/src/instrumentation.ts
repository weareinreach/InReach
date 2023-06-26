/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */

export const register = async () => {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('../instrumentation.node')
	}
}
