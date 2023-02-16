import slugify from 'slugify'

export const legacyAccessMap = new Map<string, string | undefined>([
	['email', slugify('Service Access Instructions-accessEmail', { lower: true, strict: true })],
	['file', slugify('Service Access Instructions-accessFile', { lower: true, strict: true })],
	['link', slugify('Service Access Instructions-accessLink', { lower: true, strict: true })],
	['location', slugify('Service Access Instructions-accessLocation', { lower: true, strict: true })],
	['phone', slugify('Service Access Instructions-accessPhone', { lower: true, strict: true })],
	['other', slugify('Service Access Instructions-accessText', { lower: true, strict: true })],
])
