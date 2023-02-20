/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable import/no-unused-modules */
/* eslint-disable node/no-process-env */
// @ts-ignore
const isCi = process.env.CI !== undefined
const override = process.env.OVERRIDE_CI !== undefined
if (!isCi) {
	const { execSync } = require('child_process')
	execSync('turbo run post-install', { stdio: 'inherit' })
}
if (override) {
	const { execSync } = require('child_process')
	execSync('turbo run post-install --force', { stdio: 'inherit' })
}
