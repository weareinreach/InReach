import { Prisma } from '@prisma/client'

import { prisma } from '~/client'

import { connectUser } from './user'

export const seedLanguageData: Prisma.LanguageUpsertArgs[] = [
	// en is already created during the initial user seed
	{
		where: {
			localeCode: 'en_us',
		},
		create: {
			localeCode: 'en_us',
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
			localeCode: 'en_ca',
		},
		create: {
			localeCode: 'en_ca',
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
			localeCode: 'en_mx',
		},
		create: {
			localeCode: 'en_mx',
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
			localeCode: 'es_us',
		},
		create: {
			localeCode: 'es_us',
			iso6392: 'spa',
			languageName: 'Spanish (US)',
			nativeName: 'Español (US)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			iso6392: 'spa',
			languageName: 'Spanish (US)',
			nativeName: 'Español (US)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			localeCode: 'es_ca',
		},
		create: {
			localeCode: 'es_ca',
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
			localeCode: 'es_mx',
		},
		create: {
			localeCode: 'es_mx',
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
