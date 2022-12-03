import { Command } from 'commander'
import fs from 'fs'

// import inquirer from 'inquirer'

// import { seedBasics } from './starter'

const program = new Command()
const { version } = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

program
	.name('InReach Database Seeder')
	.usage('pnpm db:seed')
	.description('Utilities to initialize a database for use with the InReach App')
	.version(version, '-v --version', 'display the current version')

program.option('-b, --basic', 'basic data staging')

program.parse(process.argv)

const options = program.opts()

if (options.basic) {
	// seedBasics()
}

// inquirer.prompt()
