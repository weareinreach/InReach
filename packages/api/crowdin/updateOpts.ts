import prettier from 'prettier'

import { writeFileSync } from 'fs'
import path from 'path'

import { crowdinApi, crowdinVars } from './client'

const writeOutput = async (filename: string, data: string, isJs = false) => {
	const prettierOpts = (await prettier.resolveConfig(__dirname)) ?? undefined
	const parser = isJs ? 'babel' : 'typescript'
	const outFile = `${path.resolve(__dirname, './')}/${filename}.${isJs ? 'mjs' : 'ts'}`

	const formattedOutput = await prettier.format(data, { ...prettierOpts, parser })
	writeFileSync(outFile, formattedOutput)
}

const updateOpts = async () => {
	const { data: branches } = await crowdinApi.sourceFilesApi.listProjectBranches(crowdinVars.projectId)
	const branchesToExport = ['main', 'dev', 'database', 'database-draft']

	const branchMap = new Map<string, number>()
	for (const { data: branch } of branches) {
		if (!branchesToExport.includes(branch.name)) continue
		branchMap.set(branch.name, branch.id)
	}

	const branchObj = Object.fromEntries(branchMap.entries())

	const fileMap = new Map<string, Record<string, number>>()

	for (const [key, value] of Object.entries(branchObj)) {
		if (!branchesToExport.includes(key)) continue
		const { data: files } = await crowdinApi.sourceFilesApi.listProjectFiles(crowdinVars.projectId, {
			branchId: value,
		})
		fileMap.set(key, Object.fromEntries(files.map(({ data }) => [data.name.replace('.json', ''), data.id])))
	}

	const fileObj = Object.fromEntries(fileMap.entries())

	const output = `
	export const branches = ${JSON.stringify(branchObj)} as const
	\n
	export const files = ${JSON.stringify(fileObj)} as const
	`

	writeOutput('opts', output)
}

updateOpts()
