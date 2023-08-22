import { z } from 'zod'

import { generateId, Prisma } from '@weareinreach/db'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { connectOne, connectOneRequired } from '~api/schemas/nestedOps'

export const ZCreateSchema = z
	.object({
		id: prefixedId('user').default(generateId('user')),
		email: z.string().email(),
		password: z.string(),
		name: z.string().optional(),
		image: z.string().url().optional(),
		active: z.boolean().optional(),
		currentCity: z.string().optional(),
		/** Defaults to `en` */
		language: z.string().default('en'),
		/**
		 * Requires either `id`, `cca2`, or `cca3`
		 *
		 * `cca2` = {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 ISO 3166-1 alpha-2 Country code}
		 *
		 * `cca3` = {@link https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3 ISO 3166-1 alpha-3 Country code}
		 */
		currentCountry: z
			.union([
				z.object({ id: prefixedId('country') }),
				z.object({ cca2: z.string().length(2) }),
				z.object({ cca3: z.string().length(3) }),
			])
			.optional(),
		/** Requires either `id` or `slug` */
		currentGovDist: z
			.union([z.object({ id: prefixedId('govDist') }), z.object({ slug: z.string() })])
			.optional(),
		userType: z.string().default('seeker'),
		cognitoMessage: z.string().default('Confirm your account'),
		cogintoSubject: z.string().default('Click the following link to confirm your account:'),
		lawPractice: z.string().optional(),
		otherLawPractice: z.string().optional(),
		servProvider: z.string().optional(),
		servProviderOther: z.string().optional(),
	})
	.transform(({ id, name, email, password, image, active, currentCity, ...data }) => {
		const userType = connectOneRequired({ type: data.userType })
		const langPref = connectOne({ localeCode: data.language })
		const currentCountry = connectOne(data.currentCountry)
		const currentGovDist = connectOne(data.currentGovDist)
		const { lawPractice, otherLawPractice, servProvider, servProviderOther } = data
		const record = {
			id,
			name,
			email,
			image,
			userType,
			langPref,
			currentCity,
			currentCountry,
			currentGovDist,
			...(lawPractice || otherLawPractice || servProvider || servProviderOther
				? { signupData: { lawPractice, otherLawPractice, servProvider, servProviderOther } }
				: {}),
		} satisfies Prisma.UserCreateArgs['data']

		return {
			prisma: Prisma.validator<Prisma.UserCreateArgs>()({
				data: {
					...record,
					auditLogs: CreateAuditLog({
						actorId: id,
						operation: 'CREATE',
						to: record,
					}),
				},
				select: { id: true },
			}),

			cognito: {
				databaseId: id,
				email,
				password,
				message: data.cognitoMessage,
				subject: data.cogintoSubject,
			},
		}
	})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
