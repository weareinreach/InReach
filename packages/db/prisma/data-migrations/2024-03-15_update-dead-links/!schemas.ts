import { z } from 'zod'

export const AccessLinksSchema = z.object({
	addNew: z
		.object({ id: z.string(), serviceId: z.string(), slug: z.string(), url: z.string().url() })
		.array(),
	updates: z
		.object({
			supplementId: z.string(),
			newUrl: z.string().url(),
		})
		.array(),
})

export const OrgUpdatesSchema = z
	.object({
		orgDesc: z.string().optional(),
		orgName: z.string().optional(),
		orgUrl: z.string().url().optional(),
		slug: z.string(),
	})
	.array()

export const ServiceNameSchema = z
	.object({
		serviceName: z.string(),
		serviceId: z.string(),
	})
	.array()
export const UnpublishSchema = z.object({
	orgs: z.string().array(),
	services: z.string().array(),
	locations: z.string().array(),
	attributeSupplements: z.string().array(),
})

export const NewAlertsSchema = z
	.object({
		slug: z.string(),
		alertText: z.string(),
		supplementId: z.string(),
		freeTextId: z.string(),
	})
	.array()
