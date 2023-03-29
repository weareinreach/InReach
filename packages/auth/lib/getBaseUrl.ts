/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
export const getBaseUrl = () => {
	if (typeof window !== 'undefined') return '' // browser should use relative url
	if (process.env.BASE_URL) return `https://${process.env.BASE_URL}` // Use env var, if set - VERCEL_URL only points to the internal `vercel.app` url.
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}
