#! /usr/bin/env tsx
/* eslint-disable node/no-process-env */
import { v2 as compose } from 'docker-compose'
import { config as loadEnv } from 'dotenv'
import { expand as dotenvExpand } from 'dotenv-expand'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import fs from 'fs'
import path from 'path'

dotenvExpand(loadEnv({ path: path.resolve(__dirname, '../.env') }))
const dockerComposeFile = path.resolve(__dirname, './docker-compose.yml')

if (!fs.existsSync(dockerComposeFile)) {
	throw new Error(`Could not find a docker compose file at: ${dockerComposeFile}`)
}

const postgresLocalUrlRegex = /^postgres:\/\/(?:([^:]+):([^@]+)@)?(?:localhost|127\.0\.0\.1)(:\d+)?\/([^?]+)/

yargs(hideBin(process.argv))
	.demandCommand(1)
	.command(
		'up',
		'Start docker containers',
		() => {},
		async () => {
			if (process.env.DATABASE_URL && postgresLocalUrlRegex.test(process.env.DATABASE_URL)) {
				console.log(`Starting docker...`)
				await compose.upAll({
					config: dockerComposeFile,
					callback: (chunk) => console.log(chunk.toString()),
				})
			} else {
				console.log(`Skipping docker start, DATABASE_URL is not set to a local address`)
			}
		}
	)
	.command(
		'down',
		'Stop docker containers',
		() => {},
		async () => {
			await compose.downAll({ config: dockerComposeFile, callback: (chunk) => console.log(chunk.toString()) })
		}
	).argv
