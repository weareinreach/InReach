// packages/ui/mockData/downloads.ts

import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

interface OrganizationCsvExportRow {
	id: string
	'Organization Name': string
	'Organization Website'?: string
	'InReach Slug': string
	'InReach Edit URL': string
	createdAt: Date
	updatedAt: Date
	lastVerified?: Date
	published: boolean
	deleted: boolean
	countryCode?: string
}

const parseCsvString = (csvString: string): OrganizationCsvExportRow[] => {
	const lines = csvString.trim().split('\n')
	if (lines.length === 0) return []

	const csvHeaders = lines[0]!.split(',').map((h) => h.trim().replace(/"/g, ''))

	return lines.slice(1).map((line) => {
		const values = line.split(',').map((v) => v.trim().replace(/"/g, ''))

		const getCsvStringValue = (headerName: string): string | undefined => {
			const index = csvHeaders.indexOf(headerName)
			const value = index !== -1 && values[index] !== undefined ? values[index] : ''
			return value === 'NULL' || value === '' ? undefined : value
		}

		const row: OrganizationCsvExportRow = {
			id: getCsvStringValue('id') || '',
			'Organization Name': getCsvStringValue('Organization Name') || '',
			'Organization Website': getCsvStringValue('Organization Website'),
			'InReach Slug': getCsvStringValue('InReach Slug') || '',
			'InReach Edit URL': getCsvStringValue('InReach Edit URL') || '',

			createdAt: new Date(getCsvStringValue('createdAt') || ''),
			updatedAt: new Date(getCsvStringValue('updatedAt') || ''),
			lastVerified: getCsvStringValue('lastVerified')
				? new Date(getCsvStringValue('lastVerified')!)
				: undefined,

			published: getCsvStringValue('published') === 'True',
			deleted: getCsvStringValue('deleted') === 'True',

			countryCode: getCsvStringValue('countryCode'),
		}

		return row
	})
}

export const downloads = {
	getAllPublishedOrganizations: getTRPCMock({
		path: ['organization', 'getAllPublishedForCSV'],
		response: async () => {
			const rawCsvContent: string = (await import('./json/downloads.forAllPublishedOrganizations.json'))
				.default
			const parsedData: ApiOutput['organization']['getAllPublishedForCSV'] = parseCsvString(rawCsvContent)
			return parsedData
		},
	}),

	getAllUnpublishedOrganizations: getTRPCMock({
		path: ['organization', 'getAllUnpublishedForCSV'],
		response: async () => {
			const rawCsvContent: string = (await import('./json/downloads.forAllUnpublishedOrganizations.json'))
				.default
			const parsedData: ApiOutput['organization']['getAllUnpublishedForCSV'] = parseCsvString(rawCsvContent)
			return parsedData
		},
	}),
}
