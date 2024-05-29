import { Prisma } from '@prisma/client'

import { generateId, idPrefix } from '~db/lib/idGen'

const applicableModels = Object.keys(idPrefix) as (keyof typeof idPrefix)[]

const isApplicableModel = (model: string | undefined): model is keyof typeof idPrefix =>
	Boolean(model) && applicableModels.includes(model as keyof typeof idPrefix)

export const idGeneratorExtension = Prisma.defineExtension({
	name: 'Id Generator',
	query: {
		$allOperations({ args, model, operation, query }) {
			if (model) {
				model = model.charAt(0).toLowerCase() + model.slice(1)
			}
			if (isApplicableModel(model)) {
				switch (operation) {
					case 'create': {
						if (args.data) {
							args.data.id ??= generateId(model)
						}
						break
					}
					case 'createMany': {
						if (Array.isArray(args.data)) {
							args.data.forEach((item: Record<string, unknown>) => {
								item.id ??= generateId(model)
							})
						}
						break
					}
					case 'upsert': {
						args.create.id ??= generateId(model)
						break
					}
				}
			}
			return query(args)
		},
	},
})
