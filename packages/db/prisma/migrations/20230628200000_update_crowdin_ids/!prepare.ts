import sql from 'sql-bricks'

import fs from 'fs'
import path from 'path'

const prepare = async () => {
	const sqlInsert: { key: string; crowdinId: number }[] = []
	const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './out.json'), 'utf-8')) as {
		key: string
		ns: string
		crowdinId: number
	}[]
	for (const item of data) {
		sqlInsert.push({ key: item.key, crowdinId: item.crowdinId })
	}

	fs.writeFileSync(path.resolve(__dirname, './insert.sql'), sql.insert('keys_temp', sqlInsert).toString())
}

prepare()
