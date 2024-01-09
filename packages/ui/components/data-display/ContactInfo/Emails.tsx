import { Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'

import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSlug } from '~ui/hooks/useSlug'
import { trpc as api } from '~ui/lib/trpcClient'

import { type EmailsProps } from './types'

export const Emails = ({ parentId = '', passedData, direct, locationOnly, serviceOnly }: EmailsProps) => {
	const output: ReactElement[] = []
	const slug = useSlug()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t } = useTranslation(orgId?.id ? ['common', orgId.id, 'user-title'] : ['common', 'user-title'])
	const variants = useCustomVariant()
	const { data } = api.orgEmail.forContactInfo.useQuery(
		{ parentId, locationOnly, serviceOnly },
		{ enabled: !passedData }
	)
	let k = 0

	const componentData = passedData ? passedData : data

	if (!componentData?.length) return null

	for (const email of componentData) {
		const {
			primary,
			title,
			description,
			email: address,
			locationOnly: showLocOnly,
			serviceOnly: showServOnly,
		} = email
		if ((locationOnly && !showLocOnly) || (serviceOnly && !showServOnly)) continue

		const href = `mailto:${address}`
		if (!isExternal(href)) continue
		if (direct) {
			return (
				<Stack spacing={12}>
					<Title order={3}>{t('direct.email')}</Title>
					<Link external href={href} variant={variants.Link.inlineInverted}>
						{address}
					</Link>
				</Stack>
			)
		}
		const desc = title
			? t(title.key, { ns: 'user-title' })
			: description?.key
				? t(description.key, { defaultValue: description.defaultText, ns: orgId?.id })
				: undefined

		const item = (
			<Stack spacing={4} key={k}>
				<Link key={k} external href={href} variant={variants.Link.inlineInverted}>
					{address}
				</Link>
				{desc && <Text variant={variants.Text.utility4darkGray}>{desc}</Text>}
			</Stack>
		)
		primary ? output.unshift(item) : output.push(item)
		k++
	}
	return (
		<Stack spacing={12}>
			<Title order={3}>{t('words.email')}</Title>
			{output}
		</Stack>
	)
}
