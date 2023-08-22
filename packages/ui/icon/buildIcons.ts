/* eslint-disable import/no-unused-modules */
import { listIcons } from '@iconify/react'

import { writeFileSync } from 'fs'

import { loadIcons } from './iconCollection'

loadIcons()

const generate = async () => {
	const iconList = `// generated file - do not modify directly\n// prettier-ignore\nexport const iconList = ${JSON.stringify(
		listIcons()
	)} as const\n`

	writeFileSync('./icon/iconList.ts', iconList)

	console.info(`Generated Icon List with ${listIcons().length} icons`)
}
generate()
