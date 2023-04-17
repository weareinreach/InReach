/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable import/no-unused-modules */
/* eslint-disable node/no-process-env */
// @ts-ignore
const isCi = process.env.CI !== undefined
const override = process.env.OVERRIDE_CI !== undefined
const skip = process.env.SKIP_PI !== undefined
if ((!isCi || override) && !skip) {
	const { execSync } = require('child_process')
	require('dotenv').config()
	const dbUrl = process.env.DATABASE_URL
	let command = 'turbo run post-install'
	if (typeof dbUrl === 'string' && dbUrl.substring(0, 6) === 'prisma') {
		command = `PRISMA_GENERATE_DATAPROXY=true ${command}`
	}
	if (override) {
		command = `${command} --force`
	}

	execSync(command, { stdio: 'inherit' })
}
