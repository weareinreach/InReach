import sql from 'sql-bricks'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'

const prepare = async () => {
	const keys = await prisma.translationKey.findMany({ where: { ns: 'org-data' }, select: { key: true } })
	const ids = await prisma.organization.findMany({ select: { id: true, slug: true } })

	const idMap = new Map<string, string>(ids.map((i) => [i.slug, i.id]))
	const prismaStatements: Prisma.TranslationKeyUpdateArgs[] = []
	const invalidKeys: string[] = []
	const sqlInsert: { old: string; new: string }[] = []

	for (const key of keys) {
		const slug = key.key.split('.').slice(0, 1).join('')
		const id = idMap.get(slug)
		if (id) {
			const newKey = key.key.replace(slug, id)
			prismaStatements.push({ where: { ns_key: { ns: 'org-data', key: key.key } }, data: { key: newKey } })
			sqlInsert.push({ old: key.key, new: newKey })
		} else {
			invalidKeys.push(key.key)
		}
	}
	fs.writeFileSync(path.resolve(__dirname, './prisma.json'), JSON.stringify(prismaStatements))
	fs.writeFileSync(path.resolve(__dirname, './insert.sql'), sql.insert('keys_temp', sqlInsert).toString())
	fs.writeFileSync(path.resolve(__dirname, './invalid-keys.json'), JSON.stringify(invalidKeys))
}

prepare()
