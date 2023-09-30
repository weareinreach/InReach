/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable node/no-process-env */
// @ts-ignore
const isCi = process.env.CI !== undefined || process.env.CI_USE_HUSKY === 'true'
if (!isCi) {
	require('husky').install()
}
