import Listr from 'listr'
import { Observable } from 'rxjs'

import { seedSystemUser } from './01-user'
import { seedLanguages } from './02-languages'
import { seedEthnicities } from './03-ethnicities'
import { seedCountries } from './04-countries'

const tasks = new Listr([
	{
		title: 'Seeding basic data...',
		task: () =>
			new Listr([
				{
					title: 'System user',
					task: async () =>
						new Observable<string>((subscriber) => {
							seedSystemUser(subscriber)
						}),
				},
				{
					title: 'Languages',
					task: async () =>
						new Observable<string>((subscriber) => {
							seedLanguages(subscriber)
						}),
				},
				{
					title: 'Ethnicities',
					task: async () =>
						new Observable<string>((subscriber) => {
							seedEthnicities(subscriber)
						}),
				},
				{
					title: 'Countries',
					task: async () =>
						new Observable<string>((subscriber) => {
							seedCountries(subscriber)
						}),
				},
			]),
	},
])

tasks.run()
