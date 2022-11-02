import * as z from 'zod'

import { CompleteOrgSocialMedia, CompleteUser, OrgSocialMediaModel, UserModel } from './index'

export const _SocialMediaServiceModel = z.object({
	id: z.string(),
	name: z.string(),
	urlBase: z.string(),
	logoIcon: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteSocialMediaService extends z.infer<typeof _SocialMediaServiceModel> {
	orgSocialMedia: CompleteOrgSocialMedia[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * SocialMediaServiceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SocialMediaServiceModel: z.ZodSchema<CompleteSocialMediaService> = z.lazy(() =>
	_SocialMediaServiceModel.extend({
		orgSocialMedia: OrgSocialMediaModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
