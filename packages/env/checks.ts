/* eslint-disable node/no-process-env */

/**
 * Checks if the code is running in a browser environment.
 *
 * @returns {boolean} Returns true if the code is running in a browser environment, otherwise returns false.
 */
export const isBrowser = typeof window !== 'undefined'
/**
 * Checks if the application is running in development mode.
 *
 * @returns {boolean} Returns true if the application is in development mode, false otherwise.
 */
export const isDev = process.env.NODE_ENV !== 'production'

/**
 * Checks if the application is running on Vercel.
 *
 * @returns {boolean} True if running on Vercel, false otherwise.
 */
export const isVercel = !!(process.env.VERCEL ?? process.env.NEXT_PUBLIC_VERCEL)

/**
 * Get the Vercel environment. Can be used on server or client.
 *
 * @returns The Vercel environment.
 */
const getVercelEnv = () => process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV
/**
 * Checks if Vercel is active in development mode for a branch that is not `dev`.
 *
 * @returns {boolean} Whether Vercel is active in development mode or not.
 */
export const isVercelActiveDev =
	(process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF !== 'dev') ||
	(process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
		process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF !== 'dev')

/**
 * Checks if Vercel is active in development mode for any branch.
 *
 * @returns {boolean} Whether Vercel is active in development mode or not.
 */
export const isVercelDev =
	process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'

/**
 * Checks if the application is running in Vercel production mode.
 *
 * @returns {boolean} True if running in Vercel production mode, false otherwise.
 */
export const isVercelProd =
	process.env.VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
/**
 * Checks if the application is running in a local development environment.
 *
 * @returns {boolean} True if running in local development, false otherwise.
 */
export const isLocalDev =
	process.env.NODE_ENV === 'development' &&
	!isVercel &&
	!['preview', 'production'].includes(getVercelEnv() ?? 'nope')
