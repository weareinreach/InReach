import axios from 'axios'
import { Listr, ListrRenderer, ListrTaskWrapper } from 'listr2'

import fs from 'fs'
import path from 'path'

const baseUrl = 'https://raw.github.com/weareinreach/seed-data/main/geojson/'
const saveDir = path.resolve(__dirname, 'data/downloaded/')

const files = [
	'cities-ca.json',
	'cities-mx.json',
	'cities-us.json',
	'counties-pr.json',
	'counties-us.json',
	'country-ca.json',
	'country-gu.json',
	'country-mx.json',
	'country-pr.json',
	'country-us.json',
	'country-vi.json',
	'provinces-ca.json',
	'states-mx.json',
	'states-us.json',
] as const

export const downloadData = (task: ListrTask) => {
	const tasks: ListrSubTask[] = []

	for (const file of files) {
		tasks.push({
			title: file,
			task: async () => {
				task.output = `Downloading: ${baseUrl}${file}`
				const { data, status } = await axios.get(`${baseUrl}${file}`)

				if (status !== 200) throw new Error('Fetch error')

				const outFile = path.resolve(saveDir, file)
				task.output = `Writing: ${outFile}`
				fs.writeFileSync(outFile, JSON.stringify(data))
			},
		} satisfies ListrSubTask)
	}
	return task.newListr(tasks)
}

export const task = new Listr(
	[
		{
			title: 'Download seed data',
			task: (_, task) => downloadData(task),
			options: {
				bottomBar: 10,
			},
		},
	],
	{
		rendererOptions: {
			showTimer: true,
			collapse: false,
		},
		exitOnError: false,
	}
)

task.run()

type ListrTask = ListrTaskWrapper<unknown, typeof ListrRenderer>
type ListrSubTask = ListrTask['newListr']['arguments']
