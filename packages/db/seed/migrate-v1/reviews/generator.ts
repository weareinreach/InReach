/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Prisma } from '@db/client'
import { CommentsJSONCollection } from '@db/datastore/v1/mongodb/output-types/comments'
import { RatingsJSONCollection } from '@db/datastore/v1/mongodb/output-types/ratings'
import { prisma } from '@db/index'
import { userEmail } from '@db/seed/data'
import { migrateLog } from '@db/seed/logger'
import { ListrTask } from '@db/seed/migrate-v1'

import fs from 'fs'

export const orgReviews: Prisma.OrgReviewCreateManyInput[] = []
const migratedRecords: unknown[] = []
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
			name: true,
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

			services: {
				select: {
					tag: { select: { name: true } },
				},
			},
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
	const orgMap = new Map<string, { id: string; name: string }>(
		orgs.map((x) => [x.legacyId ?? '', { id: x.id, name: x.name }])
	)
	const serviceMap = new Map<string, string>(services.map((x) => [x.legacyId ?? '', x.id]))

	for (const item of ratings) {
		const organization = orgMap.get(item.organizationId)
		const orgServiceId = item.serviceId ? serviceMap.get(item.serviceId) : undefined
		if (!organization || !item.ratings.length) {
			log(
				`🤷 SKIPPING Rating ${item._id.$oid}: ${
					!organization ? 'Cannot map organization' : 'No ratings attached'
				}`
			)
			continue
		}
		const { id: organizationId, name } = organization
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
			log(`🏗️ Migrated rating for ${name}${orgServiceId ? `: ServiceID: ${orgServiceId}` : ''} `)
		}
		migratedRecords.push(item)
	}
	for (const item of comments) {
		const organization = orgMap.get(item.organizationId)
		const orgServiceId = item.serviceId ? serviceMap.get(item.serviceId) : undefined
		if (!organization || !item.comments.length) {
			log(
				`🤷 SKIPPING review comment ${item._id.$oid}: ${
					!organization ? 'Cannot map organization' : 'No reviews attached'
				}`
			)
			continue
		}
		const { id: organizationId, name } = organization
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
			log(`🏗️ Migrated review for ${name}${orgServiceId ? `: ServiceID: ${orgServiceId}` : ''} `)
		}
		migratedRecords.push(item)
	}
}
