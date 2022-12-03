import { Prisma } from '@prisma/client'

import { prisma } from '~/index'

import { connectUser } from './user'

const languages = [
	{
		localeCode: 'en-US',
		iso6392: 'eng',
		languageName: 'English (US)',
		nativeName: 'English (US)',
	},
	{
		localeCode: 'en-CA',
		iso6392: 'eng',
		languageName: 'English (CA)',
		nativeName: 'English (CA)',
	},
	{
		localeCode: 'en-MX',
		iso6392: 'eng',
		languageName: 'English (MX)',
		nativeName: 'English (MX)',
	},
	{
		localeCode: 'es',
		iso6392: 'spa',
		languageName: 'Spanish',
		nativeName: 'Español',
	},
	{
		localeCode: 'es-US',
		iso6392: 'spa',
		languageName: 'Spanish (US)',
		nativeName: 'Español (EE)',
	},
	{
		localeCode: 'es-CA',
		iso6392: 'spa',
		languageName: 'Spanish (CA)',
		nativeName: 'Español (CA)',
	},
	{
		localeCode: 'es-MX',
		iso6392: 'spa',
		languageName: 'Spanish (MX)',
		nativeName: 'Español (MX)',
	},
]

// en is already created during the initial user seed
export const seedLanguageData: Prisma.LanguageUpsertArgs[] = languages.map((lang) => {
	const { localeCode, iso6392, languageName, nativeName } = lang

	return {
		where: {
			localeCode,
		},
		create: {
			localeCode,
			iso6392,
			languageName,
			nativeName,
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392,
			languageName,
			nativeName,
			updatedBy: connectUser,
		},
	}
})

export const getPrimaryLanguages = async () =>
	await prisma.language.findMany({
		where: {
			iso6392: {
				not: null,
			},
			primary: true,
		},
		select: {
			id: true,
			iso6392: true,
			localeCode: true,
		},
	})

export type PrimaryLanguages = Prisma.PromiseReturnType<typeof getPrimaryLanguages>
