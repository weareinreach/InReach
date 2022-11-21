import { Prisma } from '@prisma/client'

import { prisma } from '~/index'

import { connectUser } from './user'

export const seedLanguageData: Prisma.LanguageUpsertArgs[] = [
	// en is already created during the initial user seed
	{
		where: {
			localeCode: 'en-US',
		},
		create: {
			localeCode: 'en-US',
			iso6392: 'eng',
			languageName: 'English (US)',
			nativeName: 'English (US)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'eng',
			languageName: 'English (US)',
			nativeName: 'English (US)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'en-CA',
		},
		create: {
			localeCode: 'en-CA',
			iso6392: 'eng',
			languageName: 'English (CA)',
			nativeName: 'English (CA)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'eng',
			languageName: 'English (CA)',
			nativeName: 'English (CA)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'en-MX',
		},
		create: {
			localeCode: 'en-MX',
			iso6392: 'eng',
			languageName: 'English (MX)',
			nativeName: 'English (MX)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'eng',
			languageName: 'English (MX)',
			nativeName: 'English (MX)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'es',
		},
		create: {
			localeCode: 'es',
			iso6392: 'spa',
			languageName: 'Spanish',
			nativeName: 'Español',
			primary: true,
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'spa',
			languageName: 'Spanish',
			nativeName: 'Español',
			primary: true,
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'es_US',
		},
		create: {
			localeCode: 'es-US',
			iso6392: 'spa',
			languageName: 'Spanish (US)',
			nativeName: 'Español (EE)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'spa',
			languageName: 'Spanish (US)',
			nativeName: 'Español (EE)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'es-CA',
		},
		create: {
			localeCode: 'es-CA',
			iso6392: 'spa',
			languageName: 'Spanish (CA)',
			nativeName: 'Español (CA)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'spa',
			languageName: 'Spanish (CA)',
			nativeName: 'Español (CA)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'es-MX',
		},
		create: {
			localeCode: 'es-MX',
			iso6392: 'spa',
			languageName: 'Spanish (MX)',
			nativeName: 'Español (MX)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'spa',
			languageName: 'Spanish (MX)',
			nativeName: 'Español (MX)',
			updatedBy: connectUser,
		},
	},
]

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
