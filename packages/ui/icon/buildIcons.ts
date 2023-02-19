/* eslint-disable import/no-unused-modules */
import { listIcons } from '@iconify/react'
import prettier from 'prettier'

import { writeFileSync } from 'fs'

import { loadIcons } from './iconCollection'

loadIcons()

const generate = async () => {
	const prettierOpts = (await prettier.resolveConfig(__dirname)) ?? undefined
	const iconList = `// generated file - do not modify directly\nexport const iconList = ${JSON.stringify(
		listIcons()
	)} as const`

	const formattedOutput = prettier.format(iconList, {
		...prettierOpts,
		parser: 'typescript',
	})

	writeFileSync('./icon/iconList.ts', formattedOutput)

	console.info(`Generated Icon List with ${listIcons().length} icons`)
}
generate()
