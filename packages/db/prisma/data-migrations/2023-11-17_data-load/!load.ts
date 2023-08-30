/* eslint-disable node/no-process-env */
import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import PQueue from 'p-queue'
import PRetry from 'p-retry'
import papa from 'papaparse'

import fs from 'fs'
import path from 'path'

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCT_CREDS as string)
const scopes = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file']
const jwt = new JWT({
	email: creds.client_email,
	key: creds.private_key,
	scopes,
})
const sheetID = '17Egecl5U8_o8Nx8qic5cUE7oD3A8__2KgXilz-7yoMU'

const queue = new PQueue({
	concurrency: 1,
	interval: 2250,
	intervalCap: 1,
	autoStart: false,
	carryoverConcurrencyCount: true,
})
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
const main = async () => {
	const wb = new GoogleSpreadsheet(sheetID, jwt)
	await wb.loadInfo()

	const sheetsToGet = {
		Orgs: 'organization',
		Emails: 'orgEmail',
		'Access Instructions': 'svcAccess',
		Phones: 'orgPhone',
		Locations: 'orgLocation',
		OrgSocial: 'orgSocial',
		Services: 'orgService',
	}
	const joinsToGet = {
		OrgServicePhone: 'orgServicePhone',
		OrgServiceEmail: 'orgServiceEmail',
		OrgLocationEmail: 'orgLocationEmail',
		OrgLocationService: 'orgLocationService',
		OrgLocationPhone: 'orgLocationPhone',
	}
	const data = {}
	const joins = {}

	const getData = async (sheetName: string) => {
		const sheet = wb.sheetsByTitle[sheetName]
		console.log('Parsing', sheetName)
		if (!sheet) throw new Error(`Sheet ${sheetName} not found in spreadsheet ${sheetID}`)
		const csv = await sheet.downloadAsCSV()
		const parsed = papa.parse(csv.toString(), { header: true, skipEmptyLines: 'greedy' })
		const dataName = sheetsToGet[sheetName]
		console.log(sheetName, `returned ${parsed.data.length} rows`)
		data[dataName] = parsed.data
	}

	const getJoin = async (joinName: string) => {
		const sheet = wb.sheetsByTitle[joinName]
		console.log('Parsing', joinName)
		if (!sheet) throw new Error(`Sheet ${joinName} not found in spreadsheet ${sheetID}`)
		const csv = await sheet.downloadAsCSV()
		const parsed = papa.parse(csv.toString(), { header: true, skipEmptyLines: true })
		console.log(joinName, `returned ${parsed.data.length} rows`)
		const dataName = joinsToGet[joinName]
		joins[dataName] = parsed.data
	}

	for (const sheetName of Object.keys(sheetsToGet)) {
		queue.add(async () => {
			await PRetry(() => getData(sheetName), {
				onFailedAttempt: async (err) => {
					console.error(`[${err.attemptNumber}/${err.retriesLeft}] ${err.message} -- Trying again`)
					// await sleep(5000)
				},
				// factor: 3,
				randomize: true,
			})
		})
	}
	queue.add(async () => {
		console.log("Let google catch it's breath")
		await sleep(5000)
	})

	for (const joinName of Object.keys(joinsToGet)) {
		queue.add(async () => {
			await PRetry(() => getJoin(joinName), {
				onFailedAttempt: async (err) => {
					console.error(
						`[${err.attemptNumber}/${err.retriesLeft}] ${err.message} -- Trying again in 5 seconds`
					)
					await sleep(5000)
				},
			})
		})
	}
	queue.add(() => {
		console.log('writing data.json')
		fs.writeFileSync(path.resolve(__dirname, 'load.json'), JSON.stringify(data))
		console.log('writing joins.json')
		fs.writeFileSync(path.resolve(__dirname, 'joins.json'), JSON.stringify(joins))
	})
	queue.start()
}

main()
