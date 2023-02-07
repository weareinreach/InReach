import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const CreateOrgPhoneSchema = z.object({
	number: z.string(),
	ext: z.string().nullish(),
	primary: z.boolean().default(false),
	published: z.boolean().default(false),
	countryId: z.string(),
	phoneTypeId: z.string().optional(),
	locationOnly: z.boolean().default(false),
})

export const CreateNestedOrgPhoneSchema = CreateOrgPhoneSchema.array()

export const CreateNestedOrgPhonePrisma = (data?: z.infer<typeof CreateNestedOrgPhoneSchema>) => {
	if (!data) return undefined

	return Prisma.validator<Prisma.OrgPhoneCreateNestedManyWithoutOrganizationInput>()({
		createMany: {
			skipDuplicates: true,
			data: data.map(({ number, ext, primary, published, countryId, phoneTypeId, locationOnly }) => ({
				number,
				ext,
				primary,
				published,
				countryId,
				phoneTypeId,
				locationOnly,
			})),
		},
	})
}
