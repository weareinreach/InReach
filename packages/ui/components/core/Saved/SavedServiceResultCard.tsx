import { Divider, Group, Space, Stack, Text, Title } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'

import { type ApiOutput } from '@weareinreach/api'
import { SavedResultLoading } from '~ui/components/core/Saved/SavedOrgResultCard'
import { useCustomVariant } from '~ui/hooks'

import { ActionButtons } from '../ActionButtons'
import { Link } from '../Link'
import classes from './shared.module.css'

const SavedResultData = ({ result: savedItem }: SavedResultHasData) => {
	const { description, slug, orgName } = savedItem
	const { t, ready: i18nReady } = useTranslation(['common', savedItem.id])
	const variants = useCustomVariant()
	const { hovered, ref: hoverRef } = useHover()

	if (!i18nReady) {
		return <SavedResultLoading />
	}

	return (
		<>
			<Stack gap={16} ref={hoverRef}>
				<Stack gap={0}>
					<Group align='center' justify='space-between' wrap='nowrap'>
						<Title
							order={2}
							className={classes.hoverText}
							mb={12}
							{...(hovered && { 'data-hovered': hovered })}
						>
							<Link
								href={{ pathname: '/org/[slug]', query: { slug } }}
								variant={variants.Link.inheritStyle}
								td='none'
							>
								{savedItem.name
									? t(savedItem.name.key, { ns: savedItem.name.ns, defaultValue: savedItem.name.defaultText })
									: ''}
								<Space w={4} display='inline-block' />
							</Link>
						</Title>
						<ActionButtons.Save
							itemId={savedItem.id}
							itemName={
								savedItem.name
									? t(savedItem.name.key, { ns: savedItem.name.ns, defaultValue: savedItem.name.defaultText })
									: ''
							}
						/>
					</Group>
					<Link
						href={{ pathname: '/org/[slug]', query: { slug } }}
						variant={variants.Link.inheritStyle}
						td='none'
					>
						<Stack gap={12}>
							<Text variant={variants.Text.utility2darkGray}>{orgName}</Text>
							{description && (
								<Text className={classes.description}>
									{t(description.key, { ns: description.ns, defaultValue: description.defaultText })}
								</Text>
							)}
						</Stack>
					</Link>
				</Stack>
			</Stack>
			<Divider my={40} />
		</>
	)
}

export type SavedResultCardProps = SavedResultHasData | SavedResultLoading

export const SavedServiceResultCard = (props: SavedResultCardProps) =>
	props.loading ? <SavedResultLoading /> : <SavedResultData {...props} />

type Service = NonNullable<ApiOutput['savedList']['getById']>['services'][number]

type SavedResultHasData = {
	result: Service
	loading?: boolean
}
