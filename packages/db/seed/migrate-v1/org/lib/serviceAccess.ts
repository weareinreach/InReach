import slugify from 'slugify'

export const legacyAccessMap = new Map<string, string | undefined>([
	['email', slugify('Service Access Instructions-accessEmail', { lower: true })],
	['file', slugify('Service Access Instructions-accessFile', { lower: true })],
	['link', slugify('Service Access Instructions-accessLink', { lower: true })],
	['location', slugify('Service Access Instructions-accessLocation', { lower: true })],
	['phone', slugify('Service Access Instructions-accessPhone', { lower: true })],
	['other', slugify('Service Access Instructions-accessText', { lower: true })],
])
