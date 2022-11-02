import { Prisma } from '@prisma/client'

import { connectUser } from './user'

export const seedLanguageData: Prisma.LanguageUpsertArgs[] = [
	// en is already created during the initial user seed
	{
		where: {
			langCode: 'en_us',
		},
		create: {
			langCode: 'en_us',
			languageName: 'English (US)',
			nativeName: 'English (US)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'English (US)',
			nativeName: 'English (US)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			langCode: 'en_ca',
		},
		create: {
			langCode: 'en_ca',
			languageName: 'English (CA)',
			nativeName: 'English (CA)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'English (CA)',
			nativeName: 'English (CA)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			langCode: 'en_mx',
		},
		create: {
			langCode: 'en_mx',
			languageName: 'English (MX)',
			nativeName: 'English (MX)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'English (MX)',
			nativeName: 'English (MX)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			langCode: 'es',
		},
		create: {
			langCode: 'es',
			languageName: 'Spanish',
			nativeName: 'Español',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'Spanish',
			nativeName: 'Español',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			langCode: 'es_us',
		},
		create: {
			langCode: 'es_us',
			languageName: 'Spanish (US)',
			nativeName: 'Español (US)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'Spanish (US)',
			nativeName: 'Español (US)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			langCode: 'es_ca',
		},
		create: {
			langCode: 'es_ca',
			languageName: 'Spanish (CA)',
			nativeName: 'Español (CA)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'Spanish (CA)',
			nativeName: 'Español (CA)',
			updatedBy: connectUser,
		},
	},
	{
		where: {
			langCode: 'es_mx',
		},
		create: {
			langCode: 'es_mx',
			languageName: 'Spanish (MX)',
			nativeName: 'Español (MX)',
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName: 'Spanish (MX)',
			nativeName: 'Español (MX)',
			updatedBy: connectUser,
		},
	},
]
