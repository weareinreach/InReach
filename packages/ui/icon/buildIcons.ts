import { listIcons } from '@iconify/react'

import { writeFileSync } from 'fs'

import { loadIcons } from './iconCollection'

loadIcons()

const iconList = `// generated file - do not modify directly\nexport const iconList = ${JSON.stringify(
	listIcons()
)} as const`

writeFileSync('./icon/iconList.ts', iconList)
