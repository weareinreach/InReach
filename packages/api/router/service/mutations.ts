import { handleError } from '~api/lib'
import { defineRouter, permissionedProcedure } from '~api/lib/trpc'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import {
	AttachServAttribute,
	AttachServiceTags,
	CreateOrgService,
	CreateServiceArea,
	CreateServiceAreaRefine,
	LinkServiceEmail,
	LinkServicePhone,
	AttachServAccess,
	UpdateOrgService,
} from '~api/schemas/create/orgService'

export const mutations = defineRouter({
	create: permissionedProcedure('createOrgService')
		.input(CreateOrgService().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = { actorId: ctx.session.user.id, operation: 'CREATE', data: input }

			const record = CreateOrgService().dataParser.parse(inputData)
			const result = await ctx.prisma.orgService.create(record)
			return result
		}),
	update: permissionedProcedure('updateOrgService')
		.input(UpdateOrgService)
		.mutation(async ({ ctx, input }) => {
			const { where, data } = input
			const updatedRecord = await ctx.prisma.$transaction(async (tx) => {
				const current = await tx.orgService.findUniqueOrThrow({ where })
				const updated = await tx.orgService.update({
					where,
					data: {
						...data,
						auditLogs: CreateAuditLog({ actorId: ctx.actorId, operation: 'UPDATE', from: current, to: data }),
					},
				})
				return updated
			})
			return updatedRecord
		}),
	attachServiceAttribute: permissionedProcedure('attachServiceAttribute')
		.input(AttachServAttribute().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.actorId,
				operation: 'CREATE',
				data: input,
			}
			const { attributeSupplement, auditLogs, freeText, serviceAttribute, translationKey } =
				AttachServAttribute().dataParser.parse(inputData)

			const result = await ctx.prisma.$transaction(async (tx) => {
				const tKey = translationKey ? tx.translationKey.create(translationKey) : undefined
				const fText = freeText ? tx.freeText.create(freeText) : undefined
				const aSupp = attributeSupplement ? tx.attributeSupplement.create(attributeSupplement) : undefined
				const attrLink = tx.serviceAttribute.create(serviceAttribute)
				const logs = tx.auditLog.createMany({ data: auditLogs, skipDuplicates: true })
				return {
					translationKey: tKey,
					freeText: fText,
					attributeSupplement: aSupp,
					serviceAttribute: attrLink,
					auditLog: logs,
				}
			})
			return result
		}),
	attachServiceTags: permissionedProcedure('attachServiceTags')
		.input(AttachServiceTags().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.actorId,
				operation: 'LINK',
				to: input,
			}
			const { auditLogs, orgServiceTag } = AttachServiceTags().dataParser.parse(inputData)
			const results = await ctx.prisma.$transaction(async (tx) => {
				const tags = await tx.orgServiceTag.createMany(orgServiceTag)
				const logs = await tx.auditLog.createMany(auditLogs)
				return { orgServiceTag: tags.count, auditLog: logs.count }
			})
			return results
		}),
	createServiceArea: permissionedProcedure('createServiceArea')
		.input(CreateServiceArea().inputSchema.refine(CreateServiceAreaRefine))
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.actorId,
				operation: 'CREATE',
				data: input,
			}
			const { serviceArea, auditLog, serviceAreaCountry, serviceAreaDist } =
				CreateServiceArea().dataParser.parse(inputData)
			const result = await ctx.prisma.$transaction(async (tx) => {
				const area = await tx.serviceArea.create(serviceArea)
				const countries = serviceAreaCountry
					? await tx.serviceAreaCountry.createMany({ data: serviceAreaCountry, skipDuplicates: true })
					: undefined
				const districts = serviceAreaDist
					? await tx.serviceAreaDist.createMany({ data: serviceAreaDist, skipDuplicates: true })
					: undefined
				const logs = await tx.auditLog.createMany({ data: auditLog, skipDuplicates: true })

				return {
					serviceArea: area.id,
					auditLog: logs.count,
					serviceAreaCountry: countries?.count ?? 0,
					serviceAreaDist: districts?.count ?? 0,
				}
			})
			return result
		}),
	linkEmails: permissionedProcedure('linkServiceEmail')
		.input(LinkServiceEmail().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.actorId,
				operation: 'CREATE',
				data: input,
			}
			const { auditLog, orgServiceEmail } = LinkServiceEmail().dataParser.parse(inputData)
			const result = await ctx.prisma.$transaction(async (tx) => {
				const links = await tx.orgServiceEmail.createMany({ data: orgServiceEmail, skipDuplicates: true })
				const logs = await tx.auditLog.createMany({ data: auditLog, skipDuplicates: true })
				return { orgServiceEmail: links.count, auditLog: logs.count }
			})
			return result
		}),
	linkPhones: permissionedProcedure('linkServicePhone')
		.input(LinkServicePhone().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = {
				actorId: ctx.actorId,
				operation: 'CREATE',
				data: input,
			}
			const { auditLog, orgServicePhone } = LinkServicePhone().dataParser.parse(inputData)
			const result = await ctx.prisma.$transaction(async (tx) => {
				const links = await tx.orgServicePhone.createMany({ data: orgServicePhone, skipDuplicates: true })
				const logs = await tx.auditLog.createMany({ data: auditLog, skipDuplicates: true })
				return { orgServicePhone: links.count, auditLog: logs.count }
			})
			return result
		}),
	createAccessInstructions: permissionedProcedure('createAccessInstructions')
		.input(AttachServAccess().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = { actorId: ctx.actorId, operation: 'CREATE', data: input }

			const {
				serviceAccess,
				serviceAccessAttribute,
				attributeSupplement,
				auditLogs,
				freeText,
				translationKey,
			} = AttachServAccess().dataParser.parse(inputData)
			const result = await ctx.prisma.$transaction(async (tx) => {
				const tKey = translationKey ? tx.translationKey.create(translationKey) : undefined
				const fText = freeText ? tx.freeText.create(freeText) : undefined
				const aSupp = attributeSupplement ? tx.attributeSupplement.create(attributeSupplement) : undefined
				const access = tx.serviceAccess.create(serviceAccess)
				const attrLink = tx.serviceAccessAttribute.create(serviceAccessAttribute)
				const logs = tx.auditLog.createMany({ data: auditLogs, skipDuplicates: true })
				return {
					translationKey: tKey,
					freeText: fText,
					attributeSupplement: aSupp,
					serviceAccess: access,
					serviceAccessAttribute: attrLink,
					auditLog: logs,
				}
			})
			return result
		}),
})
