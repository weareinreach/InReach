import { Prisma } from '@weareinreach/db'
import superjson from 'superjson'
import { z } from 'zod'

// import { prismaQueriesAlt } from './prismaQueryClients'
import { getSchema, PrismaTables, AuditLogSchema, SchemaKey, AuditIds, BaseSchema } from '../schemas/auditLog'

const operationMap = {
	create: 'CREATE',
	update: 'UPDATE',
	delete: 'DELETE',
	link: 'LINK',
	unlink: 'UNLINK',
} as const

/**
 * Creates a formatted Audit Log entry
 *
 * @example
 *
 * ```typescript
 *                  Type arguments: "to" data ⤵   db table ⤵
 * const auditLogs = createAuditLogs<typeof inputData, 'tableName'>({table,operation,actorId,to})
 *
 * const dbTxn = await prisma.tableName.create({
 * 	data: {
 * 		...data,
 * 		auditLogs
 * 	}
 * })
 * ```
 *
 * @param _arg0.table - Database table name
 * @param _arg0.operation - Data operation
 * @param _arg0.actorId - `userId` of person making change
 * @param _arg0.recordId - **OPTIONAL**: Used only for m-to-n link entries
 * @param _arg0.from - **OPTIONAL for 'create' operation**: Data before operation
 * @param _arg0.to - Data after operation
 * @returns An object that can be dropped in to a Prisma operation
 */
export const createAuditLog = <
	D extends object,
	T extends SchemaKey = SchemaKey,
	M extends Operation = Operation,
	R extends AuditIds<T> = AuditIds<T>
>({
	table,
	operation,
	actorId,
	recordId,
	from = {},
	to,
}: {
	/** Database table name */
	table: T
	/** Data operation */
	operation: M
	/** UserId of person making change */
	actorId: string
	/** Used for m-to-n link entries */
	recordId?: R extends AuditIds<T> ? R : never
	/** Data before operation */
	from?: Partial<{ [K in keyof D]: unknown }>
	/** Data after operation */
	to: D
}) => {
	const parser = operation === 'create' ? BaseSchema : getSchema(table)

	const operationValue = operationMap[operation]
	const logInput = {
		actorId,
		to: superjson.serialize(to),
		from: superjson.serialize(from),
		operation: operationValue,
		...recordId,
	}

	const newAuditLog = {
		// auditLogs: { create: parser.parse(logInput) },
		create: parser.parse(logInput),
	}

	const entry = Prisma.validator<NestedAuditLog>()({ create: parser.parse(logInput) })

	return entry
}

type AuditLogParser = <D, T extends SchemaKey, M extends Operation>(
	table: T extends Readonly<PrismaTables> ? T : never,
	operation: M,
	data: D
) => Promise<AuditLogReturn<T>>

type Operation = CreateOperation | UpdateOperation

type CreateOperation = 'create' | 'link'
type UpdateOperation = 'update' | 'delete' | 'unlink'
type ZodData<T extends Readonly<PrismaTables>> = z.input<(typeof AuditLogSchema)[T]>

type AuditLogReturn<T extends Readonly<PrismaTables>> = {
	create: z.output<(typeof AuditLogSchema)[T]> | z.output<typeof BaseSchema>
}

type DataProp<T extends Readonly<PrismaTables>, M extends Operation> = M extends CreateOperation
	? Omit<ZodData<T>, 'from'> & Partial<Pick<ZodData<T>, 'from'>>
	: ZodData<T>

type NestedAuditLog =
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutAttributeCategoryInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutAttributeInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutAttributeSupplementInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutCountryInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutFieldVisibilityInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutFooterLinkInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutFreeTextInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutGovDistInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutGovDistTypeInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutInternalNoteInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutLanguageInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutLocationPermissionInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutNavigationInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrganizationInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrganizationPermissionInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgEmailInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgHoursInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgLocationInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgPhoneInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgPhotoInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgReviewInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgServiceInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgSocialMediaInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOrgWebsiteInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOutsideAPIInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutOutsideAPIServiceInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutPermissionInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutPhoneTypeInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutServiceAccessInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutServiceAreaInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutServiceCategoryInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutServiceTagInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutSocialMediaLinkInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutSocialMediaServiceInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutSourceInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutTranslatedReviewInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutTranslationInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutTranslationNamespaceInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserCommunityInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserEthnicityInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserImmigrationInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserMailInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserRoleInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserSavedListInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserSOGIdentityInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserTitleInput
	| Prisma.AuditLogUncheckedCreateNestedManyWithoutUserTypeInput
	| { create: Prisma.AuditLogUncheckedCreateInput }
