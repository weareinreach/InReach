export * from './client'
export { getAuditedClient } from './client/extensions/auditContext'
export * from './zod_util'

export { setAuditId } from './lib/audit'
export { slug, generateUniqueSlug } from './lib/slugGen'
export { createPoint, createPointOrNull, createGeoFields } from './lib/createPoint'
export {
	generateFreeText,
	generateNestedFreeText,
	generateNestedFreeTextUpsert,
} from './lib/generateFreeText'
export { generateId, getIdPrefixRegex, isIdFor } from './lib/idGen'
export { PrismaInstrumentation } from '@prisma/instrumentation'
