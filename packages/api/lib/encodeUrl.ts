import { z } from 'zod'

export const encodeUrl = (email: string, databaseId: string, code: string) => {
	const data = { email, databaseId, code }
	const buff = Buffer.from(JSON.stringify(data), 'utf-8')
	return buff.toString('base64url')
}
export const decodeUrl = (base64: string) => {
	try {
		const buff = Buffer.from(base64, 'base64url')
		const schema = z.object({ email: z.string(), databaseId: z.string(), code: z.string() })
		return schema.parse(JSON.parse(buff.toString('utf-8')))
	} catch (err) {
		const buff = atob(base64)
		const schema = z.object({ email: z.string(), databaseId: z.string(), code: z.string() })
		return schema.parse(JSON.parse(buff))
	}
}
