import { listIcons } from '@iconify/react'

import { writeFileSync } from 'fs'

import { loadIcons } from './iconCollection'

loadIcons()

const generate = async () => {
	const iconList = listIcons().sort()

	const output = `// generated file - do not modify directly\n// prettier-ignore\nexport const iconList = ${JSON.stringify(
		iconList
	)} as const\n`

	writeFileSync('./icon/iconList.ts', output)

	console.info(`Generated Icon List with ${listIcons().length} icons`)
}
generate()
