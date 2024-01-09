import { isSocialIcon, SocialLink, type SocialLinkProps } from '~ui/components/core/SocialLink'
import { trpc as api } from '~ui/lib/trpcClient'

import { type SocialMediaProps } from './types'

export const SocialMedia = ({ parentId = '', passedData, locationOnly }: SocialMediaProps) => {
	const { data } = api.orgSocialMedia.forContactInfo.useQuery(
		{ parentId, locationOnly },
		{ enabled: !passedData }
	)

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null
	const items: SocialLinkProps[] = []

	for (const item of componentData) {
		const icon = item.service.toLowerCase()
		if (!isSocialIcon(icon)) continue
		items.push({
			icon,
			href: item.url,
			title: item.username,
		})
	}
	if (!items.length) return null
	return <SocialLink.Group links={items} header />
}
