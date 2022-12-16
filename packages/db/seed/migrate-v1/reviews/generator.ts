import { Prisma } from '@prisma/client'
import fs from 'fs'

import { CommentsJSONCollection } from '~/datastore/v1/mongodb/output-types/comments'
import { RatingsJSONCollection } from '~/datastore/v1/mongodb/output-types/ratings'
import { prisma } from '~/index'
import { userEmail } from '~/seed/data'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'

export const orgReviews: Prisma.OrgReviewCreateManyInput[] = []

export const generateReviews = async (task: ListrTask) => {
	const log = (message: string) => {
		migrateLog.info(message)
		task.output = message
	}
	const ratings: RatingsJSONCollection[] = JSON.parse(
		fs.readFileSync('./datastore/v1/mongodb/output/ratings.json', 'utf-8')
	)
	const comments: CommentsJSONCollection[] = JSON.parse(
		fs.readFileSync('./datastore/v1/mongodb/output/comments.json', 'utf-8')
	)

	const orgs = await prisma.organization.findMany({
		where: {
			legacyId: {
				not: null,
			},
		},
		select: {
			id: true,
			legacyId: true,
		},
	})
	const services = await prisma.orgService.findMany({
		where: {
			legacyId: {
				not: null,
			},
		},
		select: {
			id: true,
			legacyId: true,
		},
	})
	const users = await prisma.user.findMany({
		where: {
			legacyId: {
				not: null,
			},
		},
		select: {
			id: true,
			legacyId: true,
		},
	})
	const { id: systemUser } = await prisma.user.findFirstOrThrow({
		where: {
			email: userEmail,
		},
		select: {
			id: true,
		},
	})
	const userMap = new Map<string, string>(users.map((x) => [x.legacyId ?? '', x.id]))
	const orgMap = new Map<string, string>(orgs.map((x) => [x.legacyId ?? '', x.id]))
	const serviceMap = new Map<string, string>(services.map((x) => [x.legacyId ?? '', x.id]))

	for (const item of ratings) {
		const organizationId = orgMap.get(item.organizationId)
		const orgServiceId = item.serviceId ? serviceMap.get(item.serviceId) : undefined
		if (!organizationId || !item.ratings.length) {
			log(`🤷 SKIPPING ${item._id.$oid}: ${!organizationId ? 'Missing OrgID' : 'No ratings attached'}`)
			continue
		}
		const createdAt = item.created_at.$date
		const updatedAt = item.updated_at.$date

		for (const record of item.ratings) {
			const { rating, userId: user } = record
			const legacyId = record._id.$oid
			const userId = userMap.get(user ?? '') ?? systemUser
			orgReviews.push({
				legacyId,
				organizationId,
				orgServiceId,
				createdAt,
				updatedAt,
				rating,
				userId,
			})
			log(
				`🏗️ Migrated rating for OrgID: ${organizationId} ${orgServiceId ? `ServiceID: ${orgServiceId}` : ''} `
			)
		}
	}
	for (const item of comments) {
		const organizationId = orgMap.get(item.organizationId)
		const orgServiceId = item.serviceId ? serviceMap.get(item.serviceId) : undefined
		if (!organizationId || !item.comments.length) {
			log(`🤷 SKIPPING ${item._id.$oid}: ${!organizationId ? 'Missing OrgID' : 'No reviews attached'}`)
			continue
		}
		const createdAt = item.created_at.$date
		const updatedAt = item.updated_at.$date

		for (const record of item.comments) {
			const { comment: reviewText, userId: user, userLocation: lcrCity, isDeleted, is_deleted } = record
			const legacyId = record._id.$oid
			const userId = userMap.get(user ?? '') ?? systemUser
			const deleted = isDeleted ?? is_deleted
			orgReviews.push({
				legacyId,
				organizationId,
				orgServiceId,
				createdAt,
				updatedAt,
				reviewText,
				userId,
				lcrCity,
				deleted,
			})
			log(
				`🏗️ Migrated review for OrgID: ${organizationId} ${orgServiceId ? `ServiceID: ${orgServiceId}` : ''} `
			)
		}
	}
}
